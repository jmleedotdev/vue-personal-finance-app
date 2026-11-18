import { expect, test, type Page } from '@playwright/test'

async function openDelete(page: Page, category: string) {
  await page.getByRole('button', { name: `Manage ${category} budget`, exact: true }).click()
  await page.getByRole('menuitem', { name: 'Delete Budget', exact: true }).click()
  await expect(page.getByRole('menu')).toHaveCount(0)
  return page.getByRole('dialog', { name: `Delete ‘${category}’?`, exact: true })
}

test('all cancellation paths restore the card focus and background; confirmation focuses Add', async ({
  page,
}) => {
  await page.goto('/budgets')
  const trigger = page.getByRole('button', { name: 'Manage Entertainment budget', exact: true })
  for (const path of ['cancel', 'close', 'Escape', 'backdrop']) {
    const dialog = await openDelete(page, 'Entertainment')
    const close = dialog.getByRole('button', { name: 'Close dialog' })
    const cancel = dialog.getByRole('button', { name: 'No, Go Back' })
    await expect(dialog).toHaveAccessibleDescription(
      /Only the Budget will be removed. Your transactions will not be deleted./,
    )
    await expect(close).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(cancel).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(close).toBeFocused()
    await dialog.getByRole('heading').click()
    await expect(dialog).toBeVisible()
    const dismiss: Record<string, () => Promise<void>> = {
      cancel: () => cancel.click(),
      close: () => close.click(),
      Escape: () => page.keyboard.press('Escape'),
      backdrop: () => page.mouse.click(5, 5),
    }
    await dismiss[path]!()
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect(page.getByRole('article')).toHaveCount(4)
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    await expect(page.getByRole('navigation')).not.toHaveAttribute('inert')
  }
  const dialog = await openDelete(page, 'Entertainment')
  await dialog.getByRole('button', { name: 'Yes, Confirm Deletion' }).click()
  await expect(page.getByRole('button', { name: 'Add New Budget', exact: true })).toBeFocused()
  await expect(page.locator('article h2')).toHaveText(['Bills', 'Dining Out', 'Personal Care'])
})

test('delete all, neutral charts, retained transaction history, add again and real reload reset', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/budgets')
  const summary = page.getByRole('region', { name: 'Spending Summary' })
  const chart = summary.getByRole('img')
  const bounds = (await chart.boundingBox())!
  await page.mouse.move(bounds.x + bounds.width * 0.55, bounds.y + bounds.height * 0.06)
  await expect(summary.getByText('of $50 limit', { exact: true })).toBeVisible()
  for (const category of ['Entertainment', 'Bills', 'Dining Out', 'Personal Care']) {
    const dialog = await openDelete(page, category)
    await dialog.getByRole('button', { name: 'Yes, Confirm Deletion' }).click()
    await expect(page.getByRole('button', { name: 'Add New Budget', exact: true })).toBeFocused()
  }
  await expect(page.getByRole('heading', { name: 'No budgets yet' })).toBeVisible()
  await expect(chart).toHaveAccessibleName('August 2024 budget spending: $0 spent of $0 limit.')
  await expect(chart.locator('path')).toHaveCount(0)
  await expect(summary.getByText('of $50 limit', { exact: true })).toHaveCount(0)
  await expect(summary.getByText('$0', { exact: true })).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(page.getByRole('img', { name: /August 2024 budget spending/ })).toHaveAccessibleName(
    'August 2024 budget spending: $0 spent of $0 limit.',
  )
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Transactions', exact: true })
    .click()
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await page.getByRole('combobox', { name: 'Filter by category', exact: true }).click()
  await page.getByRole('option', { name: 'Entertainment', exact: true }).click()
  await expect(page.locator('tbody th').first()).toHaveText('James Thompson')
  await page.getByRole('navigation').getByRole('link', { name: 'Budgets', exact: true }).click()
  await expect(page.getByRole('article')).toHaveCount(0)
  await page.getByRole('button', { name: 'Add New Budget', exact: true }).click()
  const add = page.getByRole('dialog', { name: 'Add New Budget', exact: true })
  await expect(add.getByRole('combobox', { name: 'Budget Category' })).toContainText('Bills')
  await expect(add.getByRole('combobox', { name: 'Theme', exact: true })).toContainText('Green')
  await add.getByRole('textbox', { name: 'Maximum Spend' }).fill('200')
  await add.getByRole('button', { name: 'Add Budget', exact: true }).click()
  await expect(page.getByRole('article', { name: 'Bills', exact: true })).toContainText('$150.00')
  await expect(chart).toHaveAccessibleName('August 2024 budget spending: $150 spent of $200 limit.')
  await expect(chart.locator('path')).not.toHaveCount(0)
  await page.reload()
  await expect(page.locator('article h2')).toHaveText([
    'Entertainment',
    'Bills',
    'Dining Out',
    'Personal Care',
  ])
  await expect(chart).toHaveAccessibleName('August 2024 budget spending: $338 spent of $975 limit.')
  expect(errors).toEqual([])
})

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 700 },
  { width: 375, height: 600 },
  { width: 320, height: 360 },
  { width: 600, height: 480 },
  { width: 900, height: 320 },
]) {
  test(`delete menu and confirmation fit ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('/budgets')
    await page.evaluate(() => document.fonts.ready)
    const trigger = page.getByRole('button', { name: 'Manage Personal Care budget', exact: true })
    await trigger.click()
    await expect(page.getByRole('menu')).toBeInViewport({ ratio: 1 })
    const remove = page.getByRole('menuitem', { name: 'Delete Budget', exact: true })
    await remove.hover()
    await page.screenshot({ path: testInfo.outputPath('delete-menu-hover.png') })
    await remove.click()
    const dialog = page.getByRole('dialog', { name: 'Delete ‘Personal Care’?', exact: true })
    await expect(dialog).toBeInViewport({ ratio: 1 })
    await page.screenshot({ path: testInfo.outputPath('delete-default.png') })
    const confirm = dialog.getByRole('button', { name: 'Yes, Confirm Deletion' })
    await confirm.hover()
    await page.screenshot({ path: testInfo.outputPath('delete-hover.png') })
    await page.keyboard.press('Tab')
    await expect(confirm).toBeFocused()
    await expect(confirm).toBeInViewport({ ratio: 1 })
    await page.screenshot({ path: testInfo.outputPath('delete-focus.png') })
    await confirm.click()
    const add = page.getByRole('button', { name: 'Add New Budget', exact: true })
    await expect(add).toBeFocused()
    await expect(add).toBeInViewport({ ratio: 1 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const last = page.getByRole('article').last()
    await last.evaluate((card) => card.scrollIntoView({ block: 'end' }))
    const cardBounds = (await last.boundingBox())!
    const navBounds = (await page.getByRole('navigation').boundingBox())!
    const bottomEdge = viewport.width < 1280 ? navBounds.y : viewport.height
    expect(cardBounds.y + cardBounds.height).toBeLessThanOrEqual(bottomEdge)
  })
}
