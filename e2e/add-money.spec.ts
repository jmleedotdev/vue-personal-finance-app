import { expect, test, type Page } from '@playwright/test'

async function openAddition(page: Page, name = 'Savings') {
  await page
    .getByRole('article', { name, exact: true })
    .getByRole('button', { name: '+ Add Money', exact: true })
    .click()
  return page.getByRole('dialog', { name: `Add to ‘${name}’`, exact: true })
}

test('transfer dialog contains focus, isolates background, discards drafts and restores focus', async ({
  page,
}) => {
  await page.goto('/pots')
  const opener = page
    .getByRole('article', { name: 'Savings', exact: true })
    .getByRole('button', { name: '+ Add Money', exact: true })
  const dialog = await openAddition(page)
  const amount = dialog.getByRole('textbox', { name: 'Amount to Add' })
  const close = dialog.getByRole('button', { name: 'Close dialog' })
  const confirm = dialog.getByRole('button', { name: 'Confirm Addition' })
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
    await amount.fill('400')
    await expect(dialog.locator('dd')).toHaveText('$559.00')
    await dialog.getByRole('heading').click()
    await expect(dialog).toBeVisible()
    await dismiss()
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
    await openAddition(page)
    await expect(amount).toHaveValue('')
    await expect(dialog.locator('dd')).toHaveText('$159.00')
  }
  await amount.fill('4836.01')
  await confirm.click()
  await expect(amount).toBeFocused()
  await expect(amount).toHaveAccessibleDescription(
    'Enter an amount within your available Current Balance.',
  )
  await expect(dialog.locator('dd')).toHaveText('$159.00')
  await amount.fill('4836')
  await confirm.click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Pots', exact: true })).toBeFocused()
  for (const button of await page.getByRole('button', { name: '+ Add Money', exact: true }).all()) {
    await expect(button).toBeDisabled()
    await expect(button).not.toHaveAttribute('aria-describedby')
  }
  await expect(
    page.getByRole('article', { name: 'Savings', exact: true }).locator('dd'),
  ).toHaveText('$4,995.00')
  await page.getByRole('navigation').getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(page.getByLabel('Balance summaries')).toHaveText(
    'Current Balance$0.00Income$3,814.25Expenses$1,700.50',
  )
  await expect(page.locator('section[aria-labelledby="pots-heading"]')).toContainText(
    'Total Saved$5,756',
  )
  await page.getByRole('navigation').getByRole('link', { name: 'Pots', exact: true }).click()
  await expect(opener).toBeDisabled()
  await page.reload()
  await expect(opener).toBeEnabled()
  await expect(
    page.getByRole('article', { name: 'Savings', exact: true }).locator('dd'),
  ).toHaveText('$159.00')
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
  test(`addition preview geometry and controls fit ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('/pots')
    await page.evaluate(() => document.fonts.ready)
    const dialog = await openAddition(page)
    const amount = dialog.getByRole('textbox', { name: 'Amount to Add' })
    await expect(dialog).toBeInViewport({ ratio: 1 })
    await amount.hover()
    await amount.fill('400')
    const bar = dialog.getByRole('progressbar')
    await expect(bar).toHaveAttribute('aria-valuetext', '27.95% saved toward target of $2,000.00')
    const geometry = await bar.evaluate((element) => ({
      bar: element.getBoundingClientRect().width,
      existing: element.children[0]!.getBoundingClientRect().width,
      addition: element.children[1]!.getBoundingClientRect().width,
      colors: Array.from(element.children, (child) => getComputedStyle(child).backgroundColor),
    }))
    expect(geometry.existing / geometry.bar).toBeCloseTo(0.0795, 3)
    expect(geometry.addition / geometry.bar).toBeCloseTo(0.2, 3)
    expect(geometry.colors[0]).not.toBe(geometry.colors[1])
    await page.screenshot({ path: testInfo.outputPath('addition-preview.png') })
    for (const [input, percentage] of [
      ['.01', '7.95'],
      ['1841', '100'],
      ['2000', '100'],
    ]) {
      await amount.fill(input!)
      expect(Number(await bar.getAttribute('aria-valuenow'))).toBeCloseTo(
        input === '.01' ? 7.9505 : Number(percentage),
        4,
      )
      const bounds = await bar.evaluate((element) => ({
        width: element.getBoundingClientRect().width,
        filled: Array.from(element.children).reduce(
          (sum, child) => sum + child.getBoundingClientRect().width,
          0,
        ),
      }))
      expect(bounds.filled).toBeLessThanOrEqual(bounds.width + 0.1)
    }
    await amount.fill('400')
    const confirm = dialog.getByRole('button', { name: 'Confirm Addition' })
    await confirm.scrollIntoViewIfNeeded()
    await expect(confirm).toBeInViewport({ ratio: 1 })
    await confirm.hover()
    await page.screenshot({ path: testInfo.outputPath('addition-confirm.png') })
    await confirm.click()
    await expect(dialog).toHaveCount(0)
    const overTarget = await openAddition(page, 'Concert Ticket')
    await overTarget.getByRole('textbox', { name: 'Amount to Add' }).fill('41')
    await overTarget.getByRole('button', { name: 'Confirm Addition' }).click()
    await openAddition(page, 'Concert Ticket')
    await expect(overTarget.locator('dd')).toHaveText('$151.00')
    await overTarget.getByRole('textbox', { name: 'Amount to Add' }).fill('.01')
    await expect(overTarget.locator('dd')).toHaveText('$151.01')
    await expect(overTarget.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '100.67% saved toward target of $150.00',
    )
    const overBounds = await overTarget.getByRole('progressbar').evaluate((element) => ({
      width: element.getBoundingClientRect().width,
      existing: element.children[0]!.getBoundingClientRect().width,
      addition: element.children[1]!.getBoundingClientRect().width,
    }))
    expect(overBounds.existing).toBeCloseTo(overBounds.width, 1)
    expect(overBounds.addition).toBe(0)
    await page.screenshot({ path: testInfo.outputPath('already-over-target.png') })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
