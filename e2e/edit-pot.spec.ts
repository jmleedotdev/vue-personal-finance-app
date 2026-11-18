import { expect, test, type Page } from '@playwright/test'

async function openEdit(page: Page, name = 'Savings') {
  await page.getByRole('button', { name: `Manage ${name} pot`, exact: true }).click()
  await page.getByRole('menuitem', { name: 'Edit Pot', exact: true }).click()
  await expect(page.getByRole('menu')).toHaveCount(0)
  return page.getByRole('dialog', { name: 'Edit Pot', exact: true })
}

test('Edit menu and dialog support keyboard, containment, Escape ordering and draft dismissal', async ({
  page,
}) => {
  await page.goto('/pots')
  const trigger = page.getByRole('button', { name: 'Manage Savings pot', exact: true })
  const edit = page.getByRole('menuitem', { name: 'Edit Pot' })
  await trigger.focus()
  await page.keyboard.press('ArrowDown')
  await expect(edit).toBeFocused()
  const remove = page.getByRole('menuitem', { name: 'Delete Pot' })
  await page.keyboard.press('ArrowUp')
  await expect(remove).toBeFocused()
  await page.keyboard.press('Home')
  await expect(edit).toBeFocused()
  await page.keyboard.press('End')
  await expect(remove).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(edit).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await page.keyboard.press('Space')
  await expect(edit).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('menu')).toHaveCount(0)
  await trigger.click()
  await page.getByRole('heading', { name: 'Pots', exact: true }).click()
  await expect(page.getByRole('menu')).toHaveCount(0)
  await trigger.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Edit Pot' })
  const name = dialog.getByRole('textbox', { name: 'Pot Name' })
  const target = dialog.getByRole('textbox', { name: 'Target' })
  const theme = dialog.getByRole('combobox', { name: 'Theme', exact: true })
  const close = dialog.getByRole('button', { name: 'Close dialog' })
  const save = dialog.getByRole('button', { name: 'Save Changes' })
  await expect(name).toBeFocused()
  await expect(dialog).toHaveAccessibleDescription(
    'If your saving targets change, feel free to update your pots.',
  )
  await page.keyboard.press('Shift+Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(save).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(name).toBeFocused()
  await page.locator('nav a[aria-label="Overview"]').evaluate((link: HTMLElement) => link.focus())
  await expect(name).toBeFocused()
  await page.mouse.wheel(0, 600)
  expect(await page.evaluate(() => scrollY)).toBe(0)
  await theme.click()
  await expect(dialog.getByRole('option', { name: 'Green', exact: true })).toBeEnabled()
  await expect(dialog.getByRole('option', { name: 'Navy Already used' })).toBeDisabled()
  await page.keyboard.press('Escape')
  await expect(dialog.getByRole('listbox')).toHaveCount(0)
  await expect(dialog).toBeVisible()
  await target.fill('1.001')
  await save.click()
  await expect(target).toBeFocused()
  await expect(target).toHaveValue('1.001')
  await expect(target).toHaveAccessibleDescription(
    'Enter an amount above $0 with up to 2 decimal places.',
  )
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  for (const dismiss of [() => close.click(), () => page.mouse.click(5, 5)]) {
    await openEdit(page)
    await expect(name).toHaveValue('Savings')
    await expect(target).toHaveValue('2000.00')
    await expect(theme).toContainText('Green')
    await name.fill('Canceled draft')
    await target.fill('5')
    await theme.click()
    await dialog.getByRole('option', { name: 'Red', exact: true }).click()
    await dialog.getByRole('heading').click()
    await expect(dialog).toBeVisible()
    await dismiss()
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  }
  await openEdit(page)
  await expect(name).toHaveValue('Savings')
  await expect(target).toHaveValue('2000.00')
  await expect(theme).toContainText('Green')
  await target.fill('100')
  await save.click()
  await expect(trigger).toBeFocused()
  await expect(page.getByRole('article').first()).toContainText('159%')
  await page.mouse.wheel(0, 600)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
})

test('editing every field preserves savings and order, updates Overview and resets on real reload', async ({
  page,
}) => {
  await page.goto('/pots')
  const dialog = await openEdit(page, 'Concert Ticket')
  await dialog.getByRole('textbox', { name: 'Pot Name' }).fill('  Live Music  ')
  await dialog.getByRole('textbox', { name: 'Target' }).fill('50.25')
  await dialog.getByRole('combobox', { name: 'Theme', exact: true }).click()
  await dialog.getByRole('option', { name: 'Red', exact: true }).click()
  await dialog.getByRole('button', { name: 'Save Changes' }).click()
  await expect(page.getByRole('button', { name: 'Manage Live Music pot' })).toBeFocused()
  await expect(page.locator('article h2')).toHaveText([
    'Savings',
    'Live Music',
    'Gift',
    'New Laptop',
    'Holiday',
  ])
  const card = page.getByRole('article', { name: 'Live Music', exact: true })
  await expect(card).toContainText('$110.00')
  await expect(card).toContainText('Target of $50.25')
  await expect(card).toContainText('218.91%')
  await expect(card.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  const bounds = await card
    .getByRole('progressbar')
    .evaluate((bar) => ({
      bar: bar.getBoundingClientRect().width,
      fill: bar.firstElementChild!.getBoundingClientRect().width,
    }))
  expect(bounds.fill).toBe(bounds.bar)
  await openEdit(page, 'Live Music')
  await expect(dialog.getByRole('combobox', { name: 'Theme', exact: true })).toContainText('Red')
  await dialog.getByRole('button', { name: 'Save Changes' }).click()
  await page.getByRole('navigation').getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(page.locator('section[aria-labelledby="pots-heading"]')).toContainText('Live Music')
  await expect(page.locator('section[aria-labelledby="pots-heading"]')).toContainText(
    'Total Saved$920',
  )
  await expect(page.getByLabel('Balance summaries')).toHaveText(
    'Current Balance$4,836.00Income$3,814.25Expenses$1,700.50',
  )
  await page.getByRole('navigation').getByRole('link', { name: 'Pots', exact: true }).click()
  await expect(card).toBeVisible()
  await page.reload()
  await expect(page.getByRole('article', { name: 'Concert Ticket', exact: true })).toContainText(
    'Target of $150.00',
  )
  await expect(card).toHaveCount(0)
})

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 700 },
  { width: 375, height: 600 },
  { width: 320, height: 360 },
  { width: 900, height: 320 },
]) {
  test(`Edit Pot menu and selector fit ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('/pots')
    await page.evaluate(() => document.fonts.ready)
    const trigger = page.getByRole('button', { name: 'Manage Holiday pot' })
    await trigger.hover()
    await trigger.click()
    await expect(page.getByRole('menu')).toBeInViewport({ ratio: 1 })
    await page.screenshot({ path: testInfo.outputPath('menu.png') })
    await page.getByRole('menuitem', { name: 'Edit Pot' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeInViewport({ ratio: 1 })
    await page.screenshot({ path: testInfo.outputPath('edit.png') })
    const theme = dialog.getByRole('combobox', { name: 'Theme', exact: true })
    await theme.hover()
    await theme.click()
    await expect(dialog.getByRole('listbox')).toBeInViewport({ ratio: 1 })
    await page.screenshot({ path: testInfo.outputPath('expanded-theme.png') })
    await page.keyboard.press('End')
    const active = await theme.getAttribute('aria-activedescendant')
    await expect(page.locator(`[id="${active}"]`)).toBeInViewport({ ratio: 1 })
    await page.keyboard.press('Enter')
    await dialog.getByRole('button', { name: 'Save Changes' }).click()
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect(trigger).toBeInViewport({ ratio: 1 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
