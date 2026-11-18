import { expect, test } from '@playwright/test'

for (const width of [1440, 768, 375, 320]) {
  test(`submitted bill search retains focus and fits beside sort at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1024 })
    await page.goto('/recurring-bills')
    const input = page.getByRole('searchbox', { name: 'Search bills' })
    const submit = page.getByRole('button', { name: 'Submit search' })
    const sort = page.getByRole('combobox', { name: 'Sort bills' })
    await input.scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollBy(0, -100))
    await input.fill('  e  ')
    await expect(page.locator('tbody tr')).toHaveCount(8)
    await expect(page).toHaveURL('/recurring-bills')
    const scrollY = await page.evaluate(() => window.scrollY)
    await input.press('Enter')
    await expect(page).toHaveURL('/recurring-bills?search=e')
    await expect(input).toHaveValue('e')
    await expect(input).toBeFocused()
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY)
    expect(await input.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )

    // Keep all rows so document-height clamping cannot mask forced scrolling.
    await input.fill('  E  ')
    await submit.hover()
    await submit.click()
    await expect(page).toHaveURL('/recurring-bills?search=E')
    await expect(submit).toBeFocused()
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY)
    await page.keyboard.press('Tab')
    await expect(sort).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(submit).toBeFocused()
    expect(await submit.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
    const inputBounds = (await input.boundingBox())!
    const sortBounds = (await sort.boundingBox())!
    expect(inputBounds.width).toBeGreaterThan(150)
    expect(inputBounds.x + inputBounds.width).toBeLessThan(sortBounds.x)
    expect(sortBounds.x + sortBounds.width).toBeLessThanOrEqual(width)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath(`search-focus-${width}.png`),
      fullPage: true,
    })

    await input.fill('  DATA ')
    await submit.click()
    await expect(page.locator('tbody th')).toHaveText(['Nimbus Data Storage'])
    await input.fill('stale draft')
    await page.goBack()
    await expect(input).toHaveValue('E')
    await expect(page.locator('tbody tr')).toHaveCount(8)
    await page.goForward()
    await expect(input).toHaveValue('DATA')
    await expect(page.locator('tbody th')).toHaveText(['Nimbus Data Storage'])
  })
}
