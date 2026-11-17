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

test('page changes scroll and focus the heading, while refresh and browser history restore results', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 650 })
  await page.goto('/transactions')
  const heading = page.getByRole('heading', { name: 'Transactions', exact: true })
  const pagination = page.getByRole('navigation', { name: 'Transaction pages' })
  await pagination.getByRole('button', { name: 'Next page' }).click()
  await expect(page).toHaveURL('/transactions?page=2')
  await expect(page.locator('tbody th').first()).toHaveText('Ella Phillips')
  await expect(heading).toBeFocused()
  await expect
    .poll(() => heading.evaluate((node) => node.getBoundingClientRect().top))
    .toBeGreaterThanOrEqual(0)
  expect((await heading.boundingBox())!.y).toBeLessThan(100)
  await pagination.getByRole('button', { name: 'Page 5', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(9)
  await expect(pagination.getByRole('button', { name: 'Next page' })).toBeDisabled()
  await page.reload()
  await expect(page.locator('tbody th').first()).toHaveText('Yuna Kim')
  await expect(pagination.getByRole('button', { name: 'Page 5', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await page.goBack()
  await expect(page).toHaveURL('/transactions?page=2')
  await expect(page.locator('tbody th').first()).toHaveText('Ella Phillips')
  await page.goForward()
  await expect(page.locator('tbody th').first()).toHaveText('Yuna Kim')
  await pagination.getByRole('button', { name: 'Page 1', exact: true }).click()
  await expect(page).toHaveURL('/transactions')
})

for (const width of [320, 375, 600, 768, 1440]) {
  test(`pagination stays compact, reachable and clear of navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 650 })
    for (const current of [1, 2, 3, 4, 5]) {
      await page.goto(`/transactions?page=${current}`)
      const pagination = page.getByRole('navigation', { name: 'Transaction pages' })
      await pagination.scrollIntoViewIfNeeded()
      await expect(pagination.getByRole('button', { name: 'Page 1', exact: true })).toBeVisible()
      await expect(pagination.getByRole('button', { name: 'Page 5', exact: true })).toBeVisible()
      await expect(
        pagination.getByRole('button', { name: `Page ${current}`, exact: true }),
      ).toHaveAttribute('aria-current', 'page')
      await expect(pagination.getByRole('button', { name: /^Page / })).toHaveCount(
        width >= 448 ? 5 : 3,
      )
      const ellipses = pagination.getByText('…', { exact: true })
      await expect(ellipses.filter({ visible: true })).toHaveCount(
        width >= 448 ? 0 : current === 3 ? 2 : 1,
      )
      expect(
        await ellipses.evaluateAll((nodes) =>
          nodes.every(
            (node) => node.closest('button, a') === null && !node.hasAttribute('tabindex'),
          ),
        ),
      ).toBe(true)
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      const bounds = await pagination.boundingBox()
      const nav = await page.getByRole('navigation', { name: 'Main navigation' }).boundingBox()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
      expect(bounds!.y + bounds!.height + 2).toBeLessThanOrEqual(width < 1280 ? nav!.y : 650)
      await expect
        .poll(() =>
          page.locator('tbody img').evaluateAll((images) =>
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
    }
  })
}

for (const width of [375, 1440]) {
  test(`submitted search retains focus and scroll and restores applied history at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 650 })
    await page.goto('/transactions?page=2')
    const input = page.getByRole('searchbox', { name: 'Search transactions' })
    const submit = page.getByRole('button', { name: 'Submit search' })
    const names = page.locator('tbody th')
    await input.fill('  a  ')
    await expect(page).toHaveURL('/transactions?page=2')
    await expect(names.first()).toHaveText('Ella Phillips')
    await page.evaluate(() => window.scrollTo(0, 80))
    await input.focus()
    const beforeEnter = await page.evaluate(() => scrollY)
    await input.press('Enter')
    await expect(page).toHaveURL('/transactions?search=a')
    await expect(input).toHaveValue('a')
    await expect(input).toBeFocused()
    expect(await page.evaluate(() => scrollY)).toBe(beforeEnter)
    await input.fill('draft that is never applied')
    await page.getByRole('button', { name: 'Next page' }).click()
    await expect(page).toHaveURL('/transactions?search=a&page=2')
    await expect(input).toHaveValue('a')
    await expect(page.getByRole('heading', { name: 'Transactions', exact: true })).toBeFocused()
    await input.fill('pending draft')
    await page.reload()
    await expect(input).toHaveValue('a')
    await expect(names.first()).toHaveText('Ella Phillips')
    await input.fill('another draft')
    await page.goBack()
    await expect(page).toHaveURL('/transactions?search=a')
    await expect(input).toHaveValue('a')
    await page.goBack()
    await expect(page).toHaveURL('/transactions?page=2')
    await expect(input).toHaveValue('')
    await expect(names.first()).toHaveText('Ella Phillips')
    await page.goForward()
    await expect(input).toHaveValue('a')
    await input.fill('  e  ')
    await submit.focus()
    const beforeClick = await page.evaluate(() => scrollY)
    await submit.click()
    await expect(page).toHaveURL('/transactions?search=e')
    await expect(input).toHaveValue('e')
    await expect(submit).toBeFocused()
    expect(await page.evaluate(() => scrollY)).toBe(beforeClick)
    await input.fill('no matching sender')
    await submit.click()
    await expect(page.getByText('No transactions found', { exact: true })).toBeVisible()
    await expect(names).toHaveCount(0)
    await expect(page.getByRole('navigation', { name: 'Transaction pages' })).toHaveCount(0)
    await input.fill('')
    await input.press('Enter')
    await expect(page).toHaveURL('/transactions')
    await expect(names).toHaveCount(10)
  })
}

test('pagination hover uses beige with white labels and carets', async ({ page }) => {
  await page.goto('/transactions?page=2')
  const pagination = page.getByRole('navigation', { name: 'Transaction pages' })
  for (const name of ['Previous page', 'Next page', 'Page 3']) {
    const button = pagination.getByRole('button', { name, exact: true })
    await button.hover()
    await expect
      .poll(() =>
        button.evaluate((node) => ({
          background: getComputedStyle(node).backgroundColor,
          color: getComputedStyle(node).color,
        })),
      )
      .toEqual({ background: 'rgb(152, 144, 139)', color: 'rgb(255, 255, 255)' })
  }
  for (const name of ['Previous page', 'Next page']) {
    const button = pagination.getByRole('button', { name, exact: true })
    await button.hover()
    await expect
      .poll(() => button.locator('svg path').evaluate((path) => getComputedStyle(path).fill))
      .toBe('rgb(255, 255, 255)')
  }
})

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
