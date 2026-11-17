import { expect, test } from '@playwright/test'

test.use({ timezoneId: 'America/Los_Angeles', reducedMotion: 'reduce' })

for (const width of [1440, 768, 375, 320, 600, 900, 1280]) {
  test(`Transactions remain readable with local avatars and navigation clearance at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/transactions')
    await page.evaluate(() => document.fonts.ready)
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(10)
    await expect(rows.first()).toContainText('Emma Richardson')
    await expect(rows.first().locator('time')).toHaveText('19 Aug 2024')
    await expect(rows.first()).toContainText('+$75.50')
    await expect(page.getByRole('link', { name: 'Transactions', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect
      .poll(() =>
        rows.locator('img').evaluateAll((images) =>
          images.every((entry) => {
            const image = entry as HTMLImageElement
            return (
              image.complete &&
              image.naturalWidth > 0 &&
              new URL(image.src).origin === location.origin
            )
          }),
        ),
      )
      .toBe(true)
    const geometry = await rows.evaluateAll((entries) =>
      entries.map((entry) => {
        const person = entry.querySelector('th')!.getBoundingClientRect()
        const [category, date, amount] = Array.from(entry.querySelectorAll('td')).map((cell) =>
          cell.getBoundingClientRect(),
        )
        return {
          fits: entry.scrollWidth <= entry.clientWidth,
          compact: category!.top >= person.bottom && date!.top >= amount!.bottom,
          columns:
            category!.left >= person.right &&
            date!.left >= category!.right &&
            amount!.left >= date!.right,
        }
      }),
    )
    expect(geometry.every((row) => row.fits && (width < 768 ? row.compact : row.columns))).toBe(
      true,
    )
    const spacing = await page.locator('table').evaluate((table) => {
      const body = table.tBodies[0]!
      const first = body.rows[0]!
      const last = body.rows[body.rows.length - 1]!
      const header = table.tHead!.rows[0]!
      return {
        top: first.getBoundingClientRect().top - body.getBoundingClientRect().top,
        bottom: body.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom,
        firstPadding: getComputedStyle(first.cells[0]!).paddingTop,
        lastPadding: getComputedStyle(last.cells[0]!).paddingBottom,
        firstRowPadding: getComputedStyle(first).paddingTop,
        lastRowPadding: getComputedStyle(last).paddingBottom,
        headerTop: getComputedStyle(header.cells[0]!).paddingTop,
        headerBottom: getComputedStyle(header.cells[0]!).paddingBottom,
        headerLeft: getComputedStyle(header.cells[0]!).paddingLeft,
        headerRight: getComputedStyle(header.cells[3]!).paddingRight,
      }
    })
    expect(spacing.top).toBeCloseTo(0, 0)
    expect(spacing.bottom).toBeCloseTo(0, 0)
    expect(spacing.firstPadding).toBe(width < 768 ? '0px' : '24px')
    expect(spacing.lastPadding).toBe(width < 768 ? '0px' : '24px')
    expect(spacing.firstRowPadding).toBe(width < 768 ? '24px' : '0px')
    expect(spacing.lastRowPadding).toBe(width < 768 ? '24px' : '0px')
    expect(spacing).toMatchObject({
      headerTop: width >= 1280 ? '12px' : '21px',
      headerBottom: width >= 1280 ? '12px' : '21px',
      headerLeft: width >= 1280 ? '16px' : '0px',
      headerRight: width >= 1280 ? '16px' : '0px',
    })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const positiveColor = await rows
      .first()
      .locator('td')
      .last()
      .evaluate((cell) => getComputedStyle(cell).color)
    expect(positiveColor).toBe('rgb(39, 124, 120)')
    await rows.last().scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const last = await rows.last().boundingBox()
    const navigation = await page.getByRole('navigation', { name: 'Main navigation' }).boundingBox()
    expect(last!.y + last!.height).toBeLessThanOrEqual(width < 1280 ? navigation!.y : 900)
  })
}

test('both entry links navigate, return to Overview, and preserve minimized navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Minimize menu' }).click()
  await page.getByRole('link', { name: 'Transactions', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Transactions', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Restore menu' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  await page.getByRole('link', { name: 'Overview', exact: true }).click()
  await page.getByRole('link', { name: 'View All' }).click()
  await expect(page).toHaveURL('/transactions')
  await page.getByRole('link', { name: 'Overview', exact: true }).click()
  await page.getByRole('link', { name: 'Skip to content' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
})

test('accepted URL variants retain the selected navigation appearance', async ({ page }) => {
  await page.goto('/transactions')
  const destination = page.getByRole('link', { name: 'Transactions', exact: true })
  const selectedBackground = await destination.evaluate(
    (link) => getComputedStyle(link).backgroundColor,
  )
  for (const path of ['/transactions/', '/Transactions']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: 'Transactions', exact: true })).toBeVisible()
    await expect(destination).toHaveAttribute('aria-current', 'page')
    expect(await destination.evaluate((link) => getComputedStyle(link).backgroundColor)).toBe(
      selectedBackground,
    )
  }
})

test('loads Transactions code only on first entry', async ({ page }) => {
  const chunks: string[] = []
  page.on('request', (request) => {
    if (
      /\/(?:assets\/TransactionsView-[^/]+\.js|src\/views\/TransactionsView\.vue)(?:\?|$)/.test(
        request.url(),
      )
    )
      chunks.push(request.url())
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
  expect(chunks).toHaveLength(0)
  await page.getByRole('link', { name: 'Transactions', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Transactions', exact: true })).toBeVisible()
  expect(chunks).toHaveLength(1)
})
