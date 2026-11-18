import { expect, test } from '@playwright/test'

for (const width of [1440, 1280, 375]) {
  test(`hovering budget segments shows category spending and restores the total limit at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1064 })
    await page.goto('/')
    const card = page.getByRole('region', { name: 'Budgets', exact: true })
    const chart = card.getByRole('img', {
      name: 'August 2024 budget spending: $338 spent of $975 limit.',
    })
    await chart.scrollIntoViewIfNeeded()
    const bounds = (await chart.boundingBox())!
    const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }
    await expect(card.getByText('of $975 limit', { exact: true })).toBeVisible()

    // Known mid-segment angles in the budget-limit-based donut, clockwise from twelve o'clock.
    for (const category of [
      { angle: 9.23, spending: '$15', limit: 'of $50 limit' },
      { angle: 156.92, spending: '$150', limit: 'of $750 limit' },
      { angle: 309.23, spending: '$133', limit: 'of $75 limit' },
      { angle: 341.54, spending: '$40', limit: 'of $100 limit' },
    ]) {
      for (const radiusRatio of [0.9, 0.73]) {
        const angle = (category.angle * Math.PI) / 180
        const radius = (bounds.width / 2) * radiusRatio
        await page.mouse.move(
          center.x + Math.sin(angle) * radius,
          center.y - Math.cos(angle) * radius,
        )
        await expect(card.getByText(category.spending, { exact: true })).toBeVisible()
        await expect(card.getByText(category.limit, { exact: true })).toBeVisible()
        await expect(card.getByText('$338', { exact: true })).toBeHidden()
        await expect(page.getByRole('status')).toBeHidden()
      }
    }
    await page.mouse.move(center.x, center.y)
    await expect(page.getByRole('status')).toBeHidden()
    await expect(card.getByText('$338', { exact: true })).toBeVisible()
    await expect(card.getByText('of $975 limit', { exact: true })).toBeVisible()
    await page.mouse.move(center.x, bounds.y + bounds.height * 0.9)
    await expect(card.getByText('$150', { exact: true })).toBeVisible()
    await expect(card.getByText('of $750 limit', { exact: true })).toBeVisible()
    await card.getByRole('heading', { name: 'Budgets', exact: true }).hover()
    await expect(page.getByRole('status')).toBeHidden()
    await expect(card.getByText('$338', { exact: true })).toBeVisible()
    await expect(card.getByText('of $975 limit', { exact: true })).toBeVisible()
  })
}

for (const width of [1440, 768, 375, 320, 600, 900, 1280]) {
  test(`budget chart and legend fit the Overview at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 768 ? 1923 : 1064 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const card = page.getByRole('region', { name: 'Budgets', exact: true })
    const chart = card.getByRole('img', {
      name: 'August 2024 budget spending: $338 spent of $975 limit.',
    })
    const legend = card.getByRole('list', { name: 'Budget categories' })
    await expect(chart).toBeVisible()
    await expect(legend.getByRole('listitem')).toHaveCount(4)
    const details = card.getByRole('link', { name: 'See Details' })
    await expect(details).toHaveAttribute('href', '/budgets')

    await expect
      .poll(async () => {
        const chartBox = (await chart.boundingBox())!
        const legendBox = (await legend.boundingBox())!
        return width < 768
          ? legendBox.y >= chartBox.y + chartBox.height - 1
          : legendBox.x >= chartBox.x + chartBox.width - 1
      })
      .toBe(true)
    const cardBox = (await card.boundingBox())!
    for (const element of [chart, legend]) {
      const box = (await element.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(cardBox.x)
      expect(box.x + box.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1)
    }
    expect(
      await legend.getByRole('listitem').evaluateAll((rows) =>
        rows.every((row) => {
          const label = row.querySelector('p')!
          const text = document.createRange()
          text.selectNodeContents(label)
          return text.getBoundingClientRect().right <= row.getBoundingClientRect().right + 1
        }),
      ),
    ).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await card.scrollIntoViewIfNeeded()
    // Bottom-navigation clearance is covered by overview.spec.ts for the final card.
    const visibleCard = (await card.boundingBox())!
    expect(visibleCard.y + visibleCard.height).toBeLessThanOrEqual(page.viewportSize()!.height)
    await card.screenshot({ path: testInfo.outputPath(`budget-${width}.png`) })
    expect(errors).toEqual([])
  })
}
