import { expect, test, type Page } from '@playwright/test'

async function openWithdrawal(page: Page, name = 'Savings') {
  await page
    .getByRole('article', { name, exact: true })
    .getByRole('button', { name: 'Withdraw', exact: true })
    .click()
  return page.getByRole('dialog', { name: `Withdraw from ‘${name}’`, exact: true })
}

test('withdrawal keyboard containment, cancellation, full withdrawal and transfer round trip survive navigation but reset on reload', async ({
  page,
}) => {
  await page.goto('/pots')
  const card = page.getByRole('article', { name: 'Savings', exact: true })
  const opener = card.getByRole('button', { name: 'Withdraw', exact: true })
  const dialog = await openWithdrawal(page)
  const amount = dialog.getByRole('textbox', { name: 'Amount to Withdraw' })
  const close = dialog.getByRole('button', { name: 'Close dialog' })
  const confirm = dialog.getByRole('button', { name: 'Confirm Withdrawal' })
  await expect(amount).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(confirm).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(amount).toBeFocused()
  await page.locator('nav a[aria-label="Overview"]').evaluate((link: HTMLElement) => link.focus())
  await expect(amount).toBeFocused()
  await page.mouse.wheel(0, 600)
  expect(await page.evaluate(() => scrollY)).toBe(0)
  for (const dismiss of [
    () => page.keyboard.press('Escape'),
    () => close.click(),
    () => page.mouse.click(5, 5),
  ]) {
    await amount.fill('20')
    await expect(dialog.locator('dd')).toHaveText('$139.00')
    await dialog.getByRole('heading').click()
    await expect(dialog).toBeVisible()
    await dismiss()
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
    await openWithdrawal(page)
    await expect(amount).toHaveValue('')
    await expect(dialog.locator('dd')).toHaveText('$159.00')
  }
  await amount.fill('159.01')
  await confirm.click()
  await expect(amount).toBeFocused()
  await expect(amount).toHaveAccessibleDescription(
    'Enter an amount within this pot’s saved amount.',
  )
  await expect(dialog.locator('dd')).toHaveText('$159.00')
  await amount.fill('159')
  await expect(dialog.locator('dd')).toHaveText('$0.00')
  await confirm.click()
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeDisabled()
  await expect(opener).not.toHaveAttribute('aria-describedby')
  await expect(page.getByRole('heading', { name: 'Pots', exact: true })).toBeFocused()
  await expect(card.locator('dd')).toHaveText('$0.00')
  await card.getByRole('button', { name: '+ Add Money', exact: true }).click()
  const addition = page.getByRole('dialog')
  await addition.getByRole('textbox', { name: 'Amount to Add' }).fill('20.01')
  await addition.getByRole('button', { name: 'Confirm Addition' }).click()
  await expect(opener).toBeEnabled()
  await page.getByRole('navigation').getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(page.getByLabel('Balance summaries')).toHaveText(
    'Current Balance$4,974.99Income$3,814.25Expenses$1,700.50',
  )
  await expect(page.locator('section[aria-labelledby="pots-heading"]')).toContainText(
    'Total Saved$781',
  )
  await page.getByRole('navigation').getByRole('link', { name: 'Pots', exact: true }).click()
  await expect(card.locator('dd')).toHaveText('$20.01')
  await page.reload()
  await expect(card.locator('dd')).toHaveText('$159.00')
  await expect(opener).toBeEnabled()
  await page.getByRole('navigation').getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(page.getByLabel('Balance summaries')).toContainText('Current Balance$4,836.00')
})

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 700 },
  { width: 375, height: 600 },
  { width: 320, height: 360 },
  { width: 900, height: 320 },
]) {
  test(`withdrawal preview geometry, empty and over-target states fit ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('/pots')
    await page.evaluate(() => document.fonts.ready)
    const dialog = await openWithdrawal(page)
    const amount = dialog.getByRole('textbox', { name: 'Amount to Withdraw' })
    await expect(dialog).toBeInViewport({ ratio: 1 })
    await amount.hover()
    await amount.fill('20')
    const bar = dialog.getByRole('progressbar')
    await expect(bar).toHaveAttribute('aria-valuetext', '6.95% saved toward target of $2,000.00')
    const geometry = await bar.evaluate((element) => ({
      bar: element.getBoundingClientRect().width,
      retained: element.children[0]!.getBoundingClientRect().width,
      withdrawn: element.children[1]!.getBoundingClientRect().width,
      colors: Array.from(element.children, (child) => getComputedStyle(child).backgroundColor),
    }))
    expect(geometry.retained / geometry.bar).toBeCloseTo(0.0695, 3)
    expect(geometry.withdrawn / geometry.bar).toBeCloseTo(0.01, 3)
    expect(geometry.colors[0]).not.toBe(geometry.colors[1])
    await page.screenshot({ path: testInfo.outputPath('withdrawal-preview.png') })
    await amount.fill('159')
    await expect(dialog.locator('dd')).toHaveText('$0.00')
    await expect(bar).toHaveAttribute('aria-valuenow', '0')
    const confirm = dialog.getByRole('button', { name: 'Confirm Withdrawal' })
    await confirm.scrollIntoViewIfNeeded()
    await expect(confirm).toBeInViewport({ ratio: 1 })
    await confirm.hover()
    await page.screenshot({ path: testInfo.outputPath('full-withdrawal.png') })
    await confirm.click()
    const card = page.getByRole('article', { name: 'Savings', exact: true })
    await expect(card.getByRole('button', { name: 'Withdraw', exact: true })).toBeDisabled()
    await expect(card.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    // Exercise above-target savings through visible controls, not private state.
    const concert = page.getByRole('article', { name: 'Concert Ticket', exact: true })
    await concert.getByRole('button', { name: '+ Add Money', exact: true }).click()
    await page.getByRole('dialog').getByRole('textbox', { name: 'Amount to Add' }).fill('100')
    await page.getByRole('button', { name: 'Confirm Addition' }).click()
    const over = await openWithdrawal(page, 'Concert Ticket')
    const overAmount = over.getByRole('textbox', { name: 'Amount to Withdraw' })
    for (const [input, expected, retained, withdrawn] of [
      ['.01', '139.99% saved toward target of $150.00', 1, 0],
      ['100', '73.33% saved toward target of $150.00', 0.7333, 0.2667],
      ['210', '0% saved toward target of $150.00', 0, 1],
    ] as const) {
      await overAmount.fill(input)
      const overBar = over.getByRole('progressbar')
      await expect(overBar).toHaveAttribute('aria-valuetext', expected)
      const bounds = await overBar.evaluate((element) => ({
        width: element.getBoundingClientRect().width,
        retained: element.children[0]!.getBoundingClientRect().width,
        withdrawn: element.children[1]!.getBoundingClientRect().width,
      }))
      expect(bounds.retained / bounds.width).toBeCloseTo(retained, 3)
      expect(bounds.withdrawn / bounds.width).toBeCloseTo(withdrawn, 3)
      expect(bounds.retained + bounds.withdrawn).toBeLessThanOrEqual(bounds.width + 0.1)
    }
    await page.screenshot({ path: testInfo.outputPath('over-target-withdrawal.png') })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
