import { expect, test } from '@playwright/test'

test.use({ hasTouch: true })

for (const width of [1440, 768, 375, 320]) {
  test(`Pot preview scrolls independently and fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1064 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const card = page.getByRole('region', { name: 'Pots', exact: true })
    const preview = page.getByRole('region', { name: 'Savings pots' })
    await expect(card.getByText('$920', { exact: true })).toBeVisible()
    await expect(card.getByRole('link', { name: 'See Details' })).toHaveAttribute('href', '/pots')
    const geometry = await preview.evaluate((region) => {
      const bounds = region.getBoundingClientRect()
      return {
        height: region.clientHeight,
        scrollHeight: region.scrollHeight,
        items: [...region.querySelectorAll('li')].map((item) => {
          const box = item.getBoundingClientRect()
          return { top: box.top - bounds.top, bottom: box.bottom - bounds.top, x: box.x }
        }),
      }
    })
    expect(geometry.scrollHeight).toBeGreaterThan(geometry.height)
    expect(
      geometry.items.slice(0, 4).every((item) => item.top >= 0 && item.bottom <= geometry.height),
    ).toBe(true)
    expect(geometry.items[0]!.top).toBe(geometry.items[1]!.top)
    expect(geometry.items[0]!.x).toBeLessThan(geometry.items[1]!.x)
    expect(geometry.items[4]!.top).toBeGreaterThanOrEqual(geometry.height)
    await expect(preview.getByText('Total Saved')).toHaveCount(0)

    await preview.focus()
    const totalBefore = await card.getByText('$920', { exact: true }).boundingBox()
    const cardBefore = await card.boundingBox()
    await page.keyboard.press('End')
    await expect.poll(() => preview.evaluate((region) => region.scrollTop)).toBeGreaterThan(0)
    await expect
      .poll(() =>
        preview.evaluate((region) => {
          const holiday = region.querySelector('li:last-child')!.getBoundingClientRect()
          const bounds = region.getBoundingClientRect()
          return holiday.top >= bounds.top && holiday.bottom <= bounds.bottom
        }),
      )
      .toBe(true)
    expect(await card.getByText('$920', { exact: true }).boundingBox()).toEqual(totalBefore)
    expect(await card.boundingBox()).toEqual(cardBefore)

    await page.keyboard.press('Home')
    await expect.poll(() => preview.evaluate((region) => region.scrollTop)).toBe(0)
    await preview.hover()
    await page.mouse.wheel(0, 100)
    await expect.poll(() => preview.evaluate((region) => region.scrollTop)).toBeGreaterThan(0)

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

for (const width of [768, 375, 320]) {
  test(`Pots card clears bottom navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 568 })
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const nav = await page.getByRole('navigation', { name: 'Main navigation' }).boundingBox()
    const card = await page.getByRole('region', { name: 'Pots', exact: true }).boundingBox()
    expect(card!.y + card!.height + 4).toBeLessThan(nav!.y)
  })
}

test('Pot preview responds to a touch swipe', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const preview = page.getByRole('region', { name: 'Savings pots' })
  await preview.scrollIntoViewIfNeeded()
  const box = (await preview.boundingBox())!
  const session = await page.context().newCDPSession(page)
  const x = box.x + box.width / 2
  const y = box.y + box.height - 5
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  for (const distance of [20, 40, 60, 80]) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: y - distance }],
    })
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect.poll(() => preview.evaluate((region) => region.scrollTop)).toBeGreaterThan(0)
  await session.detach()
})
