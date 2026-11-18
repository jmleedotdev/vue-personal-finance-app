import { expect, test, type Page } from '@playwright/test'

async function openDelete(page: Page, name = 'Savings') {
  await page.getByRole('button', { name: `Manage ${name} pot`, exact: true }).click()
  await page.getByRole('menuitem', { name: 'Delete Pot', exact: true }).click()
  await expect(page.getByRole('menu')).toHaveCount(0)
  return page.getByRole('dialog', { name: `Delete ‘${name}’?`, exact: true })
}
async function navigate(page: Page, name: string) {
  await page.getByRole('navigation').getByRole('link', { name, exact: true }).click()
}

test('keyboard menu, isolated confirmation, all cancellation paths and surviving native focus', async ({
  page,
}) => {
  await page.goto('/pots')
  const trigger = page.getByRole('button', { name: 'Manage Savings pot', exact: true })
  await trigger.focus()
  await page.keyboard.press('ArrowUp')
  const remove = page.getByRole('menuitem', { name: 'Delete Pot', exact: true })
  const edit = page.getByRole('menuitem', { name: 'Edit Pot', exact: true })
  await expect(remove).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(edit).toBeFocused()
  await page.keyboard.press('End')
  await expect(remove).toBeFocused()
  await page.keyboard.press('Home')
  await expect(edit).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  for (const path of ['cancel', 'close', 'Escape', 'backdrop']) {
    const dialog = await openDelete(page)
    await expect(dialog).toHaveAccessibleDescription(
      /\$159.00 will be returned to your Current Balance/,
    )
    const close = dialog.getByRole('button', { name: 'Close dialog' })
    const cancel = dialog.getByRole('button', { name: 'No, Go Back' })
    await expect(close).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(cancel).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(close).toBeFocused()
    expect(
      await page
        .getByRole('navigation', { includeHidden: true })
        .evaluate((nav) => !!nav.closest('[inert]')),
    ).toBe(true)
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
    await page
      .getByRole('button', { name: 'Manage Savings pot', exact: true, includeHidden: true })
      .evaluate((button: HTMLButtonElement) => button.focus())
    await expect(close).toBeFocused()
    await dialog.getByRole('heading').click()
    const dismiss: Record<string, () => Promise<void>> = {
      cancel: () => cancel.click(),
      close: () => close.click(),
      Escape: () => page.keyboard.press('Escape'),
      backdrop: () => page.mouse.click(5, 5),
    }
    await dismiss[path]!()
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect(page.getByRole('article')).toHaveCount(5)
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    await expect(page.getByRole('navigation')).not.toHaveAttribute('inert')
  }
  const dialog = await openDelete(page)
  await dialog.getByRole('button', { name: 'Yes, Confirm Deletion' }).click()
  await expect(page.getByRole('button', { name: 'Add New Pot', exact: true })).toBeFocused()
  await expect(page.locator('article h2')).toHaveText([
    'Concert Ticket',
    'Gift',
    'New Laptop',
    'Holiday',
  ])
  await navigate(page, 'Overview')
  await expect(page.getByLabel('Balance summaries')).toContainText('Current Balance$4,995.00')
  await expect(page.getByRole('region', { name: 'Pots', exact: true })).toContainText(
    'Total Saved$761',
  )
  await expect(page.locator('#pots-scroll-help')).toHaveCount(0)
})

test('delete all, recreate at zero, retain returned funds through navigation and reset on actual reload', async ({
  page,
}) => {
  await page.goto('/pots')
  for (const name of ['Savings', 'Concert Ticket', 'Gift', 'New Laptop', 'Holiday']) {
    const dialog = await openDelete(page, name)
    await dialog.getByRole('button', { name: 'Yes, Confirm Deletion' }).click()
    await expect(page.getByRole('button', { name: 'Add New Pot', exact: true })).toBeFocused()
  }
  await expect(page.getByRole('heading', { name: 'No pots yet' })).toBeVisible()
  await navigate(page, 'Overview')
  const summary = page.getByRole('region', { name: 'Pots', exact: true })
  await expect(summary).toContainText('Total Saved$0')
  await expect(summary.locator('li')).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Savings pots' })).toHaveCount(0)
  await expect(page.getByLabel('Balance summaries')).toContainText('Current Balance$5,756.00')
  await navigate(page, 'Pots')
  await expect(page.getByRole('article')).toHaveCount(0)
  await page.getByRole('button', { name: 'Add New Pot', exact: true }).click()
  const add = page.getByRole('dialog', { name: 'Add New Pot', exact: true })
  await add.getByRole('textbox', { name: 'Pot Name' }).fill('Savings')
  await add.getByRole('textbox', { name: 'Target' }).fill('2000')
  await expect(add.getByRole('combobox', { name: 'Theme', exact: true })).toContainText('Green')
  await add.getByRole('button', { name: 'Add Pot', exact: true }).click()
  await expect(page.locator('article dd')).toHaveText('$0.00')
  const dialog = await openDelete(page)
  await expect(dialog).toHaveAccessibleDescription(/\$0.00 will be returned/)
  await dialog.getByRole('button', { name: 'No, Go Back' }).click()
  await navigate(page, 'Overview')
  await expect(page.getByLabel('Balance summaries')).toContainText('Current Balance$5,756.00')
  await navigate(page, 'Pots')
  await page.reload()
  await expect(page.locator('article h2')).toHaveText([
    'Savings',
    'Concert Ticket',
    'Gift',
    'New Laptop',
    'Holiday',
  ])
  await expect(page.locator('article dd').first()).toHaveText('$159.00')
  await navigate(page, 'Overview')
  await expect(page.getByLabel('Balance summaries')).toContainText('Current Balance$4,836.00')
  await expect(summary).toContainText('Total Saved$920')
})

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 700 },
  { width: 375, height: 600 },
  { width: 320, height: 360 },
  { width: 600, height: 480 },
  { width: 900, height: 320 },
]) {
  test(`delete menu, short confirmation and empty state fit ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('/pots')
    await page.evaluate(() => document.fonts.ready)
    await page.getByRole('button', { name: 'Manage Holiday pot', exact: true }).click()
    await expect(page.getByRole('menu')).toBeInViewport({ ratio: 1 })
    const remove = page.getByRole('menuitem', { name: 'Delete Pot', exact: true })
    await remove.hover()
    await page.screenshot({ path: testInfo.outputPath('delete-menu-hover.png') })
    await remove.click()
    const dialog = page.getByRole('dialog')
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
    const add = page.getByRole('button', { name: 'Add New Pot', exact: true })
    await expect(add).toBeFocused()
    await expect(add).toBeInViewport({ ratio: 1 })
    for (const name of ['Savings', 'Concert Ticket', 'Gift', 'New Laptop']) {
      const next = await openDelete(page, name)
      await next.getByRole('button', { name: 'Yes, Confirm Deletion' }).click()
    }
    const empty = page.getByRole('region', { name: 'No pots yet' })
    await expect(empty).toBeInViewport({ ratio: 1 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const box = (await empty.boundingBox())!
    const nav = (await page.getByRole('navigation').boundingBox())!
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.width < 1280 ? nav.y : viewport.height)
    await page.screenshot({ path: testInfo.outputPath('empty-pots.png') })
  })
}
