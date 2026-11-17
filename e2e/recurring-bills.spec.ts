import { expect, test } from '@playwright/test'

for (const viewport of [
  { width: 1440, height: 1064 },
  { width: 768, height: 1923 },
  { width: 375, height: 2219 },
  { width: 320, height: 700 },
]) {
  test(`recurring-bill summaries fit and clear navigation at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const card = page.getByRole('region', { name: 'Recurring Bills', exact: true })
    await card.scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))

    const details = card.getByRole('button', { name: 'See Details' })
    await expect(details).toBeDisabled()
    await expect(details).toHaveAccessibleDescription(
      'The Recurring Bills page is not available yet.',
    )
    const geometry = await card.locator('dt').evaluateAll((labels) =>
      labels.map((label) => {
        const row = label.parentElement!
        const amount = row.querySelector('dd')!
        return {
          fits: row.scrollWidth <= row.clientWidth,
          separated: label.getBoundingClientRect().right <= amount.getBoundingClientRect().left,
        }
      }),
    )
    expect(geometry).toHaveLength(3)
    expect(geometry.every((row) => row.fits && row.separated)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const lastAmount = card.locator('dd').last()
    await expect(lastAmount).toHaveText('$59.98')
    const rowBox = (await lastAmount.boundingBox())!
    expect(rowBox.y + rowBox.height).toBeLessThanOrEqual(viewport.height)
    const navigation = (await page
      .getByRole('navigation', { name: 'Main navigation' })
      .boundingBox())!
    expect(
      rowBox.y + rowBox.height < navigation.y || rowBox.x >= navigation.x + navigation.width,
    ).toBe(true)
  })
}
