import { expect, test } from '@playwright/test'

test('Add discards drafts through close, nested Escape and backdrop, traps focus and restores the background', async ({
  page,
}) => {
  await page.goto('/budgets')
  const add = page.getByRole('button', { name: 'Add New Budget', exact: true })
  const dialog = page.getByRole('dialog', { name: 'Add New Budget' })
  await add.click()
  const category = dialog.getByRole('combobox', { name: 'Budget Category' })
  const theme = dialog.getByRole('combobox', { name: 'Theme', exact: true })
  const amount = dialog.getByRole('textbox', { name: 'Maximum Spend' })
  const close = dialog.getByRole('button', { name: 'Close dialog' })
  const submit = dialog.getByRole('button', { name: 'Add Budget', exact: true })
  await expect(category).toBeFocused()
  await expect(dialog).toHaveAccessibleDescription(
    'Choose a category to set a spending budget. These categories can help you monitor spending.',
  )
  await page.keyboard.press('Shift+Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(submit).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(category).toBeFocused()
  // Inert background cannot receive programmatic focus either.
  await page.locator('nav a[aria-label="Overview"]').evaluate((link: HTMLElement) => link.focus())
  await expect(category).toBeFocused()
  await page.mouse.wheel(0, 600)
  expect(await page.evaluate(() => scrollY)).toBe(0)
  await theme.click()
  await expect(dialog.getByRole('option', { name: 'Green Already used' })).toBeDisabled()
  await page.keyboard.press('Home')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')
  await expect(theme).toContainText('Red')
  await theme.click()
  await page.keyboard.press('Escape')
  await expect(dialog.getByRole('listbox')).toHaveCount(0)
  await expect(dialog).toBeVisible()
  await category.click()
  await dialog.getByRole('option', { name: 'General', exact: true }).click()
  await theme.click()
  await dialog.getByRole('option', { name: 'Purple', exact: true }).click()
  await amount.fill('88.88')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(add).toBeFocused()
  await add.click()
  await expect(amount).toHaveValue('')
  await expect(category).toContainText('Education')
  await expect(theme).toContainText('Red')
  await amount.fill('77')
  await dialog.getByRole('heading').click()
  await expect(dialog).toBeVisible()
  await close.click()
  await expect(add).toBeFocused()
  await add.click()
  await expect(amount).toHaveValue('')
  await amount.fill('66')
  await page.mouse.click(5, 5)
  await expect(dialog).toHaveCount(0)
  await expect(add).toBeFocused()
  await expect(page.getByRole('article')).toHaveCount(4)
  await page.mouse.wheel(0, 600)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
})

test('Add validates, synchronizes navigation, resets on real reload and keeps focus usable on exhaustion', async ({
  page,
}) => {
  await page.goto('/budgets')
  const add = page.getByRole('button', { name: 'Add New Budget', exact: true })
  await add.click()
  const dialog = page.getByRole('dialog')
  const amount = dialog.getByRole('textbox', { name: 'Maximum Spend' })
  await dialog.getByRole('button', { name: 'Add Budget', exact: true }).click()
  await expect(amount).toHaveAttribute('aria-invalid', 'true')
  await expect(amount).toBeFocused()
  await expect(amount).toHaveAccessibleDescription(
    'Enter an amount above $0 with up to 2 decimal places.',
  )
  await amount.fill('123.45')
  await dialog.getByRole('button', { name: 'Add Budget', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(add).toBeFocused()
  await expect(page.getByRole('article')).toHaveCount(5)
  await expect(page.getByRole('article').last()).toContainText('$123.45')
  await page.getByRole('navigation').getByRole('link', { name: 'Overview' }).click()
  await expect(page.locator('section[aria-labelledby="budgets-heading"]')).toContainText(
    'Education',
  )
  await page.getByRole('navigation').getByRole('link', { name: 'Budgets' }).click()
  await expect(page.getByRole('article')).toHaveCount(5)
  await page.reload()
  await expect(page.getByRole('article')).toHaveCount(4)
  // Fill every remaining demo category; the last submission disables its opener.
  for (const category of [
    'Education',
    'General',
    'Groceries',
    'Lifestyle',
    'Shopping',
    'Transportation',
  ]) {
    await add.click()
    await expect(dialog.getByRole('combobox', { name: 'Budget Category' })).toContainText(category)
    await amount.fill('20.01')
    await dialog.getByRole('button', { name: 'Add Budget', exact: true }).click()
    await expect(dialog).toHaveCount(0)
  }
  await expect(add).toBeDisabled()
  await expect(add).toHaveAccessibleDescription('')
  await expect(page.getByText('All transaction categories already have a budget.')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Budgets', exact: true })).toBeFocused()
  await expect(page.getByRole('article')).toHaveCount(10)
})

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 700 },
  { width: 375, height: 600 },
  { width: 320, height: 360 },
  { width: 900, height: 320 },
]) {
  test(`Add and expanded selectors remain reachable at ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('/budgets')
    await page.evaluate(() => document.fonts.ready)
    await page.getByRole('button', { name: 'Add New Budget', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeInViewport({ ratio: 1 })
    await page.screenshot({ path: testInfo.outputPath('add-budget.png') })
    for (const name of ['Budget Category', 'Theme']) {
      const select = dialog.getByRole('combobox', { name, exact: true })
      await select.click()
      await expect(dialog.getByRole('listbox')).toBeVisible()
      await page.screenshot({ path: testInfo.outputPath(`expanded-${name}.png`) })
      await page.keyboard.press('End')
      const active = select.getAttribute('aria-activedescendant')
      await expect(page.locator(`[id="${await active}"]`)).toBeInViewport({ ratio: 1 })
      await page.keyboard.press('Enter')
    }
    const amount = dialog.getByRole('textbox', { name: 'Maximum Spend' })
    await amount.fill('20')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await dialog.getByRole('button', { name: 'Add Budget', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.getByRole('article')).toHaveCount(5)
    await page.getByRole('button', { name: 'Add New Budget', exact: true }).click()
    await dialog.getByRole('button', { name: 'Close dialog' }).click()
    await expect(dialog).toHaveCount(0)
  })
}
