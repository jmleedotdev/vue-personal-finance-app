import { expect, test, type Page } from '@playwright/test'

// Replace only the demo-data network boundary, in Vite or a production bundle.
// Production demo data and application code remain unmodified on disk.
async function supplyBills(page: Page) {
  const transactions = Array.from({ length: 63 }, (_, i) => ({
    name: `Bill ${String(i + 1).padStart(2, '0')}`,
    avatar: '/src/assets/images/avatars/spark-electric-solutions.jpg',
    category: 'Bills',
    recurring: true,
    amount: -(i + 1),
    date: `2024-07-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z`,
  }))
  await page.route(/\.(?:js|json)(?:\?.*)?$/, async (route) => {
    const response = await route.fetch()
    const source = await response.text()
    let body = source
    if (source.includes('export const transactions =')) {
      body += `\ntransactions.splice(0, transactions.length, ...${JSON.stringify(transactions)});`
    } else if (/\btransactions:\[/.test(source)) {
      body = source.replace(
        /\btransactions:\[[^\]]*\]/,
        `transactions:${JSON.stringify(transactions)}`,
      )
    }
    await route.fulfill({ response, body })
  })
}

test.describe('larger bill histories', () => {
  test.use({ timezoneId: 'America/Los_Angeles' })

  for (const width of [1440, 768, 600, 375, 320]) {
    test(`compact pagination, scrolling and navigation clearance at ${width}px`, async ({
      page,
    }, testInfo) => {
      await supplyBills(page)
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/recurring-bills?sort=A+to+Z')
      await expect(page.locator('tbody th').first()).toHaveText('Bill 01')
      await expect(page.locator('tbody tr')).toHaveCount(10)
      await expect(page.locator('tbody time').first()).toHaveAttribute('datetime', '2024-08-01')
      const pages = page.getByRole('navigation', { name: 'Bill pages' })
      const heading = page.getByRole('heading', { name: 'Recurring Bills', exact: true })
      await expect(pages.getByRole('button', { name: 'Previous page' })).toBeDisabled()
      await expect(pages.getByRole('button', { name: 'Page 1', exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      )
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100)
      const navigation = (await page
        .getByRole('navigation', { name: 'Main navigation' })
        .boundingBox())!
      for (const control of [page.locator('tbody tr').last(), pages]) {
        const box = (await control.boundingBox())!
        expect(box.y + box.height).toBeLessThanOrEqual(900)
        expect(box.y + box.height < navigation.y || box.x >= navigation.x + navigation.width).toBe(
          true,
        )
      }
      const finalPageButton = pages.getByRole('button', { name: 'Page 7', exact: true })
      await finalPageButton.focus()
      await expect(finalPageButton).toBeFocused()
      expect(
        await finalPageButton.evaluate((element) => getComputedStyle(element).outlineStyle),
      ).not.toBe('none')
      await finalPageButton.hover()
      await page.screenshot({
        path: testInfo.outputPath(`pagination-${width}.png`),
        fullPage: true,
      })
      await finalPageButton.press('Enter')
      await expect(heading).toBeFocused()
      await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(100)
      await expect(page.locator('tbody th')).toHaveText(['Bill 61', 'Bill 62', 'Bill 63'])
      await expect(pages.getByRole('button', { name: 'Next page' })).toBeDisabled()
      await expect(finalPageButton).toHaveAttribute('aria-current', 'page')
      await pages.getByRole('button', { name: 'Previous page' }).click()
      await expect(page.locator('tbody th').first()).toHaveText('Bill 51')
      await expect(pages.getByRole('button', { name: 'Page 6', exact: true })).toBeVisible()
      await expect(pages.getByRole('button', { name: 'Page 1', exact: true })).toBeVisible()
      await expect(pages.getByRole('button', { name: 'Page 3', exact: true })).toBeVisible({
        visible: width >= 448,
      })
      await expect(pages.locator('span[aria-hidden="true"]')).toBeVisible({ visible: width < 448 })
      await pages.getByRole('button', { name: 'Page 1', exact: true }).click()
      await expect(page.locator('tbody th').first()).toHaveText('Bill 01')
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
    })
  }

  test('reload and real browser history restore combined browsing and discard stale drafts without stealing control focus', async ({
    page,
  }) => {
    await supplyBills(page)
    await page.setViewportSize({ width: 375, height: 900 })
    await page.goto('/recurring-bills?search=Bill&sort=Highest&page=2')
    const input = page.getByRole('searchbox', { name: 'Search bills' })
    const sort = page.getByRole('combobox', { name: 'Sort bills' })
    const pages = page.getByRole('navigation', { name: 'Bill pages' })
    await expect(page.locator('tbody th').first()).toHaveText('Bill 53')
    await input.fill('not submitted')
    await pages.getByRole('button', { name: 'Next page' }).click()
    await expect(page.locator('tbody th').first()).toHaveText('Bill 43')
    await expect(input).toHaveValue('Bill')
    await input.fill('discard on reload')
    await page.reload()
    await expect(input).toHaveValue('Bill')
    await expect(sort).toHaveAccessibleDescription('Highest')
    await expect(pages.getByRole('button', { name: 'Page 3', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await input.scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollBy(0, -100))
    await input.fill('  bILL  ')
    const beforeSearch = await page.evaluate(() => scrollY)
    await input.press('Enter')
    await expect(input).toHaveValue('bILL')
    await expect(input).toBeFocused()
    expect(await page.evaluate(() => scrollY)).toBe(beforeSearch)
    await expect(page.locator('tbody th').first()).toHaveText('Bill 63')
    await pages.getByRole('button', { name: 'Page 2', exact: true }).click()
    await input.fill('stale draft')
    await sort.scrollIntoViewIfNeeded()
    await sort.focus()
    const beforeSort = await page.evaluate(() => scrollY)
    await sort.press('Enter')
    await sort.press('Home')
    await sort.press('ArrowDown')
    await sort.press('ArrowDown')
    await sort.press('Enter')
    await expect(sort).toHaveAccessibleDescription('A to Z')
    await expect(sort).toBeFocused()
    expect(await page.evaluate(() => scrollY)).toBe(beforeSort)
    await expect(page.locator('tbody th').first()).toHaveText('Bill 01')
    await page.goBack()
    await expect(input).toHaveValue('bILL')
    await expect(sort).toHaveAccessibleDescription('Highest')
    await expect(page.locator('tbody th').first()).toHaveText('Bill 53')
    await page.goBack()
    await expect(page.locator('tbody th').first()).toHaveText('Bill 63')
    await page.goBack()
    await expect(input).toHaveValue('Bill')
    await expect(page.locator('tbody th').first()).toHaveText('Bill 43')
    await page.goForward()
    await page.goForward()
    await page.goForward()
    await expect(sort).toHaveAccessibleDescription('A to Z')
    await expect(page.locator('tbody th').first()).toHaveText('Bill 01')
  })
})
