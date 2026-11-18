import { expect, test, type Page } from '@playwright/test'

async function openEdit(page: Page, category = 'Entertainment') {
  await page.getByRole('button', { name: `Manage ${category} budget`, exact: true }).click()
  await page.getByRole('menuitem', { name: 'Edit Budget', exact: true }).click()
  await expect(page.getByRole('menu')).toHaveCount(0)
  return page.getByRole('dialog', { name: 'Edit Budget', exact: true })
}

test('card menu keyboard, dismissal, dialog isolation and saved/canceled focus restoration', async ({
  page,
}) => {
  await page.goto('/budgets')
  const trigger = page.getByRole('button', { name: 'Manage Entertainment budget', exact: true })
  await trigger.focus()
  await page.keyboard.press('ArrowDown')
  const edit = page.getByRole('menuitem', { name: 'Edit Budget' })
  await expect(edit).toBeFocused()
  for (const key of ['ArrowUp', 'End', 'Home', 'ArrowDown']) {
    await page.keyboard.press(key)
    await expect(edit).toBeFocused()
  }
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(page.getByRole('menu')).toHaveCount(0)
  await page.keyboard.press('Space')
  await expect(edit).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('menu')).toHaveCount(0)
  await trigger.click()
  await page.getByRole('heading', { name: 'Budgets', exact: true }).click()
  await expect(page.getByRole('menu')).toHaveCount(0)
  await trigger.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Edit Budget', exact: true })
  const category = dialog.getByRole('combobox', { name: 'Budget Category' })
  const theme = dialog.getByRole('combobox', { name: 'Theme', exact: true })
  const amount = dialog.getByRole('textbox', { name: 'Maximum Spend' })
  const close = dialog.getByRole('button', { name: 'Close dialog' })
  const save = dialog.getByRole('button', { name: 'Save Changes' })
  await expect(category).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(save).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.locator('nav a[aria-label="Overview"]').evaluate((link: HTMLElement) => link.focus())
  await expect(close).toBeFocused()
  await category.click()
  await page.keyboard.press('Escape')
  await expect(dialog.getByRole('listbox')).toHaveCount(0)
  await expect(dialog).toBeVisible()
  await theme.click()
  await expect(dialog.getByRole('option', { name: 'Green', exact: true })).toBeEnabled()
  await expect(dialog.getByRole('option', { name: 'Cyan Already used' })).toBeDisabled()
  await page.keyboard.press('Escape')
  await amount.fill('1.001')
  await save.click()
  await expect(amount).toBeFocused()
  await expect(amount).toHaveAccessibleDescription(
    'Enter an amount above $0 with up to 2 decimal places.',
  )
  await expect(amount).toHaveValue('1.001')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await openEdit(page)
  await expect(amount).toHaveValue('50.00')
  await amount.fill('60.25')
  await dialog.getByRole('heading').click()
  await expect(dialog).toBeVisible()
  await page.mouse.click(5, 5)
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await openEdit(page)
  await expect(amount).toHaveValue('50.00')
  await close.click()
  await expect(trigger).toBeFocused()
  await openEdit(page)
  await amount.fill('60.25')
  await save.click()
  await expect(trigger).toBeFocused()
  await expect(page.getByRole('article', { name: 'Entertainment', exact: true })).toContainText(
    '$60.25',
  )
})

test('edits update chart hover, Overview and routing, preserve position and reset on reload', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/budgets')
  const summary = page.getByRole('region', { name: 'Spending Summary' })
  const chart = summary.getByRole('img')
  async function hoverFirstSegment(angle: number) {
    const bounds = (await chart.boundingBox())!
    await page.mouse.move(
      bounds.x + bounds.width / 2 + Math.sin(angle) * bounds.width * 0.45,
      bounds.y + bounds.height / 2 - Math.cos(angle) * bounds.height * 0.45,
    )
  }
  await hoverFirstSegment(0.1)
  await expect(summary.getByText('of $50 limit', { exact: true })).toBeVisible()
  const dialog = await openEdit(page)
  await dialog.getByRole('combobox', { name: 'Budget Category' }).click()
  await dialog.getByRole('option', { name: 'Education', exact: true }).click()
  await dialog.getByRole('combobox', { name: 'Theme', exact: true }).click()
  await dialog.getByRole('option', { name: 'Purple', exact: true }).click()
  await dialog.getByRole('textbox', { name: 'Maximum Spend' }).fill('123.45')
  await dialog.getByRole('button', { name: 'Save Changes' }).click()
  await expect(
    page.getByRole('button', { name: 'Manage Education budget', exact: true }),
  ).toBeFocused()
  await expect(page.locator('article h2')).toHaveText([
    'Education',
    'Bills',
    'Dining Out',
    'Personal Care',
  ])
  await expect(chart).toHaveAccessibleName(
    'August 2024 budget spending: $373 spent of $1,048 limit.',
  )
  await expect(chart.locator('path[fill="#826CB0"]')).not.toHaveCount(0)
  await hoverFirstSegment(0.2)
  await expect(summary.getByText('of $123 limit', { exact: true })).toBeVisible()
  await expect(summary.getByText('$50', { exact: true })).toBeVisible()
  await summary.getByRole('heading').hover()
  await expect(summary.getByText('$373', { exact: true })).toBeVisible()
  await expect(summary.getByText('of $1,048 limit', { exact: true })).toBeVisible()
  const amountEdit = await openEdit(page, 'Education')
  await amountEdit.getByRole('textbox', { name: 'Maximum Spend' }).fill('150')
  await amountEdit.getByRole('button', { name: 'Save Changes' }).click()
  await hoverFirstSegment(0.2)
  await expect(summary.getByText('of $150 limit', { exact: true })).toBeVisible()
  await summary.getByRole('heading').hover()
  await expect(summary.getByText('of $1,075 limit', { exact: true })).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(page.locator('section[aria-labelledby="budgets-heading"]')).toContainText(
    'Education',
  )
  await expect(page.getByRole('img', { name: /August 2024 budget spending/ })).toHaveAccessibleName(
    'August 2024 budget spending: $373 spent of $1,075 limit.',
  )
  await page.getByRole('navigation').getByRole('link', { name: 'Budgets', exact: true }).click()
  await expect(page.getByRole('article').first()).toHaveAccessibleName('Education')
  await page.reload()
  await expect(page.getByRole('article').first()).toHaveAccessibleName('Entertainment')
  await expect(page.getByRole('img', { name: /August 2024 budget spending/ })).toHaveAccessibleName(
    'August 2024 budget spending: $338 spent of $975 limit.',
  )
  expect(errors).toEqual([])
})

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 700 },
  { width: 375, height: 600 },
  { width: 320, height: 360 },
  { width: 900, height: 320 },
]) {
  test(`Edit menu and selectors fit ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('/budgets')
    await page.evaluate(() => document.fonts.ready)
    const card = page.getByRole('article').last()
    const trigger = card.getByRole('button')
    await trigger.click()
    await expect(page.getByRole('menu')).toBeInViewport({ ratio: 1 })
    await page.screenshot({ path: testInfo.outputPath('menu.png') })
    await page.getByRole('menuitem', { name: 'Edit Budget' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeInViewport({ ratio: 1 })
    await page.screenshot({ path: testInfo.outputPath('edit.png') })
    for (const name of ['Budget Category', 'Theme']) {
      const select = dialog.getByRole('combobox', { name, exact: true })
      await select.click()
      await expect(dialog.getByRole('listbox')).toBeInViewport({ ratio: 1 })
      await page.screenshot({ path: testInfo.outputPath(`expanded-${name}.png`) })
      await page.keyboard.press('End')
      const active = await select.getAttribute('aria-activedescendant')
      await expect(page.locator(`[id="${active}"]`)).toBeInViewport({ ratio: 1 })
      await page.keyboard.press('Enter')
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await dialog.getByRole('button', { name: 'Save Changes' }).click()
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect(trigger).toBeInViewport({ ratio: 1 })
  })
}
