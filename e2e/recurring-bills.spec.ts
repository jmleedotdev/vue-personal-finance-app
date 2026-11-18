import { expect, test } from '@playwright/test'

test.describe('Recurring Bills page', () => {
  test.use({ timezoneId: 'America/Los_Angeles' })

  for (const viewport of [
    { width: 1440, height: 1024, arrangement: [true, false, true, false] },
    { width: 768, height: 1196, arrangement: [false, true, false, true] },
    { width: 375, height: 1370, arrangement: [false, false, true, true] },
    { width: 320, height: 700, arrangement: [false, false, true, true] },
    { width: 600, height: 900, arrangement: [false, false, true, true] },
    { width: 1024, height: 900, arrangement: [false, true, false, true] },
    { width: 1280, height: 900, arrangement: [true, false, true, false] },
  ]) {
    test(`bills fit, load local assets, and clear navigation at ${viewport.width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport)
      await page.goto('/recurring-bills')
      await page.evaluate(() => document.fonts.ready)
      await expect(
        page.getByRole('heading', { name: 'Recurring Bills', exact: true }),
      ).toBeVisible()
      await expect(page.locator('tbody tr')).toHaveCount(8)
      await expect(page.locator('tbody time').first()).toHaveText('Monthly - 2nd')
      await expect(page.locator('tbody time').first()).toHaveAttribute('datetime', '2024-08-02')
      expect(
        await page.locator('main img').evaluateAll((images) =>
          images.every((image) => {
            const img = image as HTMLImageElement
            return (
              img.complete &&
              img.naturalWidth > 0 &&
              (img.src.startsWith('data:image/') || new URL(img.src).origin === location.origin)
            )
          }),
        ),
      ).toBe(true)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      const total = (await page
        .getByRole('region', { name: 'Total Bills', exact: true })
        .boundingBox())!
      const summary = (await page
        .getByRole('region', { name: 'Summary', exact: true })
        .boundingBox())!
      const list = (await page
        .getByRole('region', { name: 'Monthly recurring bills', exact: true })
        .boundingBox())!
      expect([
        list.x >= total.x + total.width,
        summary.x >= total.x + total.width,
        summary.y >= total.y + total.height,
        list.y >= summary.y + summary.height,
      ]).toEqual(viewport.arrangement)
      await page.screenshot({
        path: testInfo.outputPath(`bills-${viewport.width}.png`),
        fullPage: true,
        animations: 'disabled',
      })
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      const last = (await page.locator('tbody tr').last().boundingBox())!
      const nav = (await page.getByRole('navigation', { name: 'Main navigation' }).boundingBox())!
      expect(last.y + last.height).toBeLessThanOrEqual(viewport.height)
      expect(last.y + last.height < nav.y || last.x >= nav.x + nav.width).toBe(true)
    })
  }

  test('preserves sidebar minimization on the bills page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1024 })
    await page.goto('/recurring-bills')
    await page.getByRole('button', { name: 'Minimize menu' }).click()
    await expect(page.getByRole('button', { name: 'Restore menu' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })

  test('navigates from Overview details, supports keyboard focus and returns with browser Back', async ({
    page,
  }) => {
    await page.goto('/')
    await page
      .getByRole('region', { name: 'Recurring Bills', exact: true })
      .getByRole('link', { name: 'See Details' })
      .click()
    await expect(page).toHaveURL('/recurring-bills')
    await expect(page.getByRole('link', { name: 'Recurring Bills', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await page.goBack()
    await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible()
    await page.goForward()
    await expect(page.getByRole('heading', { name: 'Recurring Bills', exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Recurring Bills', exact: true })).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('main')).toBeFocused()
    await page.getByRole('link', { name: 'Transactions', exact: true }).hover()
    await page.getByRole('link', { name: 'Transactions', exact: true }).focus()
    await expect(page.getByRole('link', { name: 'Transactions', exact: true })).toBeFocused()
  })
})

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

    const details = card.getByRole('link', { name: 'See Details' })
    await expect(details).toHaveAttribute('href', '/recurring-bills')
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
