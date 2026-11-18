import { expect, test } from '@playwright/test'

for (const width of [1440, 1280, 900, 768, 600, 375, 320]) {
  test(`Budgets fits ${width}px with responsive cards, local assets and navigation clearance`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 800 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const failedAssets: string[] = []
    page.on('response', (response) => {
      if (response.status() >= 400) failedAssets.push(response.url())
    })
    await page.goto('/budgets')
    await page.evaluate(() => document.fonts.ready)
    await expect(page.getByRole('heading', { name: 'Budgets', exact: true })).toBeVisible()
    await expect(
      page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: 'Budgets' }),
    ).toHaveAttribute('aria-current', 'page')
    const summary = page.getByRole('region', { name: 'Spending Summary' })
    const chart = summary.getByRole('img')
    const legend = summary.getByRole('list')
    const cards = page.getByRole('article')
    await expect(cards).toHaveCount(4)
    const summaryBox = (await summary.boundingBox())!
    const firstBox = (await cards.first().boundingBox())!
    const chartBox = (await chart.boundingBox())!
    const legendBox = (await legend.boundingBox())!
    expect(
      width >= 1280
        ? firstBox.x >= summaryBox.x + summaryBox.width
        : firstBox.y >= summaryBox.y + summaryBox.height,
    ).toBe(true)
    expect(
      width >= 768 && width < 1280
        ? legendBox.x > chartBox.x + chartBox.width
        : legendBox.y > chartBox.y + chartBox.height,
    ).toBe(true)
    for (const avatar of await cards.locator('li img').all()) {
      await expect(avatar).toBeVisible({ visible: width >= 768 })
      expect(
        await avatar.evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
      ).toBe(true)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`budgets-${width}.png`), fullPage: true })
    const finalLink = cards.last().getByRole('link')
    await finalLink.focus()
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const linkBox = (await finalLink.boundingBox())!
    const navBox = (await page.getByRole('navigation', { name: 'Main navigation' }).boundingBox())!
    expect(linkBox.y + linkBox.height).toBeLessThan(width < 1280 ? navBox.y : 800)
    expect(failedAssets).toEqual([])
    expect(errors).toEqual([])
  })
}

test('Budgets chart hover preserves category spending and restores combined totals', async ({
  page,
}) => {
  await page.goto('/budgets')
  const summary = page.getByRole('region', { name: 'Spending Summary' })
  const chart = summary.getByRole('img')
  const bounds = (await chart.boundingBox())!
  const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }
  for (const category of [
    { angle: 9.23, spent: '$15', limit: 'of $50 limit' },
    { angle: 156.92, spent: '$150', limit: 'of $750 limit' },
    { angle: 309.23, spent: '$133', limit: 'of $75 limit' },
    { angle: 341.54, spent: '$40', limit: 'of $100 limit' },
  ]) {
    const angle = (category.angle * Math.PI) / 180
    await page.mouse.move(
      center.x + Math.sin(angle) * bounds.width * 0.45,
      center.y - Math.cos(angle) * bounds.height * 0.45,
    )
    await expect(summary.getByText(category.spent, { exact: true })).toBeVisible()
    await expect(summary.getByText(category.limit, { exact: true })).toBeVisible()
  }
  await summary.getByRole('heading').hover()
  await expect(summary.getByText('$338', { exact: true })).toBeVisible()
  await expect(summary.getByText('of $975 limit', { exact: true })).toBeVisible()
})

test('keyboard skip link focuses Budgets main content and category drill-down clears browsing state', async ({
  page,
}) => {
  await page.goto('/budgets?search=old&sort=Oldest&page=2')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await page.getByRole('article', { name: 'Entertainment', exact: true }).getByRole('link').click()
  await expect(page).toHaveURL('/transactions?category=Entertainment')
  await expect(page.getByRole('searchbox')).toHaveValue('')
  await page.getByRole('link', { name: 'Budgets', exact: true }).click()
  await page.reload()
  await expect(
    page.getByRole('img', { name: 'August 2024 budget spending: $338 spent of $975 limit.' }),
  ).toBeVisible()
})

test('zero-budget fixtures render a neutral chart and coherent Overview without browser errors', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  // Replace the demo-data network boundary, as in the larger bill-history checks.
  await page.route(/\.(?:js|json)(?:\?.*)?$/, async (route) => {
    const response = await route.fetch()
    const source = await response.text()
    const body = source.includes('export const budgets =')
      ? `${source}\nbudgets.splice(0, budgets.length);`
      : source.replace(/\bbudgets:\[[^\]]*\]/, 'budgets:[]')
    await route.fulfill({ response, body })
  })
  await page.goto('/budgets')
  const label = 'August 2024 budget spending: $0 spent of $0 limit.'
  await expect(page.getByRole('img', { name: label })).toBeVisible()
  await expect(page.getByRole('img', { name: label }).locator('path')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'No budgets yet' })).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(0)
  await page.getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(page.getByRole('img', { name: label })).toBeVisible()
  expect(errors).toEqual([])
})

test('long category and payee content wraps at narrow widths', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/budgets')
  await page
    .locator(
      'article h2 span:last-child, article li > p, [aria-label="Budget categories"] li > span:first-child',
    )
    .evaluateAll((labels) => {
      labels.forEach((label) => {
        label.textContent = 'A long category or payee with an-unbroken-word-to-check-wrapping'
      })
    })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
