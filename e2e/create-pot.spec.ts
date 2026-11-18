import { expect, test } from '@playwright/test'

test('Add Pot contains focus, isolates the background and discards drafts through all dismissal paths', async ({
  page,
}) => {
  await page.goto('/pots')
  const add = page.getByRole('button', { name: 'Add New Pot', exact: true })
  await add.click()
  const dialog = page.getByRole('dialog', { name: 'Add New Pot' })
  const name = dialog.getByRole('textbox', { name: 'Pot Name' })
  const target = dialog.getByRole('textbox', { name: 'Target' })
  const theme = dialog.getByRole('combobox', { name: 'Theme', exact: true })
  const close = dialog.getByRole('button', { name: 'Close dialog' })
  const submit = dialog.getByRole('button', { name: 'Add Pot', exact: true })
  await expect(name).toBeFocused()
  await expect(dialog).toHaveAccessibleDescription(
    'Create a pot to set savings targets. These can help keep you on track as you save for special purchases.',
  )
  await page.keyboard.press('Shift+Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(submit).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(name).toBeFocused()
  await page.locator('nav a[aria-label="Overview"]').evaluate((link: HTMLElement) => link.focus())
  await expect(name).toBeFocused()
  await page.mouse.wheel(0, 600)
  expect(await page.evaluate(() => scrollY)).toBe(0)
  await theme.click()
  await expect(dialog.getByRole('option', { name: 'Green Already used' })).toBeDisabled()
  await page.keyboard.press('Home')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')
  await expect(theme).toContainText('Red')
  await theme.click()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await expect(theme).toContainText('Orange')
  await theme.click()
  await page.keyboard.press('Escape')
  await expect(dialog.getByRole('listbox')).toHaveCount(0)
  await expect(dialog).toBeVisible()
  await name.fill('Canceled goal')
  await target.fill('88.88')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(add).toBeFocused()
  for (const dismiss of [() => close.click(), () => page.mouse.click(5, 5)]) {
    await add.click()
    await expect(name).toHaveValue('')
    await expect(target).toHaveValue('')
    await expect(theme).toContainText('Red')
    await name.fill('Another draft')
    await dialog.getByRole('heading').click()
    await expect(dialog).toBeVisible()
    await dismiss()
    await expect(dialog).toHaveCount(0)
    await expect(add).toBeFocused()
  }
  await expect(page.getByRole('article')).toHaveCount(5)
  await page.mouse.wheel(0, 600)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
})

test('Add Pot validates, updates Overview, resets on reload and restores focus when the palette is exhausted', async ({
  page,
}) => {
  await page.goto('/pots')
  const add = page.getByRole('button', { name: 'Add New Pot', exact: true })
  const dialog = page.getByRole('dialog')
  const name = dialog.getByRole('textbox', { name: 'Pot Name' })
  const target = dialog.getByRole('textbox', { name: 'Target' })
  const submit = dialog.getByRole('button', { name: 'Add Pot', exact: true })
  await add.click()
  await submit.click()
  await expect(name).toBeFocused()
  await expect(name).toHaveAttribute('aria-invalid', 'true')
  await name.fill('  Rainy Days  ')
  await target.fill('1.001')
  await submit.click()
  await expect(target).toBeFocused()
  await expect(target).toHaveAccessibleDescription(
    'Enter an amount above $0 with up to 2 decimal places.',
  )
  await target.fill('123.45')
  await submit.click()
  await expect(dialog).toHaveCount(0)
  await expect(add).toBeFocused()
  await expect(page.getByRole('article').last()).toContainText('Rainy Days')
  await expect(page.getByRole('article').last()).toContainText('$0.00')
  await expect(page.getByRole('article').last()).toContainText('Target of $123.45')
  await page.getByRole('navigation').getByRole('link', { name: 'Overview' }).click()
  await expect(page.locator('section[aria-labelledby="pots-heading"]')).toContainText('Rainy Days')
  await expect(page.locator('section[aria-labelledby="pots-heading"]')).toContainText(
    'Total Saved$920',
  )
  await expect(page.getByLabel('Balance summaries')).toHaveText(
    'Current Balance$4,836.00Income$3,814.25Expenses$1,700.50',
  )
  await page.getByRole('navigation').getByRole('link', { name: 'Pots', exact: true }).click()
  await expect(page.getByRole('article')).toHaveCount(6)
  await page.reload()
  await expect(page.getByRole('article')).toHaveCount(5)
  await expect(page.getByRole('heading', { name: 'Rainy Days' })).toHaveCount(0)
  for (let index = 0; index < 10; index++) {
    await add.click()
    await name.fill(`Goal ${index}`)
    await target.fill('20.01')
    await submit.click()
    await expect(dialog).toHaveCount(0)
  }
  await expect(add).toBeDisabled()
  await expect(add).toHaveAccessibleName('Add New Pot')
  await expect(add).toHaveAccessibleDescription('')
  await expect(page.getByRole('heading', { name: 'Pots', exact: true })).toBeFocused()
  await expect(page.getByRole('article')).toHaveCount(15)
})

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 700 },
  { width: 375, height: 600 },
  { width: 320, height: 360 },
  { width: 900, height: 320 },
]) {
  test(`Add Pot and its theme selector fit ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('/pots')
    await page.evaluate(() => document.fonts.ready)
    const add = page.getByRole('button', { name: 'Add New Pot', exact: true })
    await add.hover()
    await add.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeInViewport({ ratio: 1 })
    await page.screenshot({ path: testInfo.outputPath('create-pot.png') })
    const theme = dialog.getByRole('combobox', { name: 'Theme', exact: true })
    await theme.hover()
    await theme.click()
    await expect(dialog.getByRole('listbox')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('expanded-theme.png') })
    await page.keyboard.press('End')
    const active = await theme.getAttribute('aria-activedescendant')
    await expect(page.locator(`[id="${active}"]`)).toBeInViewport({ ratio: 1 })
    await page.keyboard.press('Enter')
    await dialog.getByRole('textbox', { name: 'Pot Name' }).fill('A new goal')
    await dialog.getByRole('textbox', { name: 'Target' }).fill('20.01')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await dialog.getByRole('button', { name: 'Add Pot', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.getByRole('article')).toHaveCount(6)
  })
}
