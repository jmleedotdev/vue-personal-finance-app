import { expect, test } from '@playwright/test'

// The dates describe demo calendar days, not the viewer's local timezone.
test.use({ timezoneId: 'America/Los_Angeles' })

for (const width of [1440, 768, 375, 320, 600, 900, 1280]) {
  test(`recent transactions load local avatars and retain readable rows at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 375 ? 2219 : 1064 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const card = page.getByRole('region', { name: 'Transactions', exact: true })
    const rows = card.getByRole('listitem')
    await expect(rows).toHaveCount(10)
    await expect(card.getByRole('button', { name: 'View All' })).toBeDisabled()
    await expect(card.getByRole('button', { name: 'View All' })).toHaveAccessibleDescription(
      'The Transactions page is not available yet.',
    )
    await expect(rows.first().locator('time')).toHaveText('19 Aug 2024')
    await expect
      .poll(() =>
        rows.locator('img').evaluateAll((images) =>
          images.every((image) => {
            const avatar = image as HTMLImageElement
            return (
              avatar.complete &&
              avatar.naturalWidth > 0 &&
              new URL(avatar.src).origin === location.origin
            )
          }),
        ),
      )
      .toBe(true)
    const preview = card.getByRole('region', { name: 'Recent transactions' })
    expect(await preview.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
      true,
    )
    expect(
      await rows.last().evaluate((row) => {
        const viewport = row.closest('[role="region"]')!.getBoundingClientRect()
        return row.getBoundingClientRect().top >= viewport.bottom
      }),
    ).toBe(true)
    await preview.focus()
    const headerBefore = await card.getByRole('heading', { name: 'Transactions' }).boundingBox()
    await page.keyboard.press('End')
    await expect.poll(() => preview.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
    await expect
      .poll(() =>
        rows.last().evaluate((row) => {
          const viewport = row.closest('[role="region"]')!.getBoundingClientRect()
          const bounds = row.getBoundingClientRect()
          return bounds.top >= viewport.top && bounds.bottom <= viewport.bottom + 1
        }),
      )
      .toBe(true)
    expect((await card.getByRole('heading', { name: 'Transactions' }).boundingBox())!.y).toBe(
      headerBefore!.y,
    )
    const geometry = await rows.evaluateAll((entries) =>
      entries.map((entry) => {
        const row = entry.getBoundingClientRect()
        const name = entry.querySelector('h3')!
        const nameBox = name.getBoundingClientRect()
        const details = entry.querySelector('div')!.getBoundingClientRect()
        const text = document.createRange()
        text.selectNodeContents(name)
        const nameText = text.getBoundingClientRect()
        return {
          textFits: nameText.left >= row.left && nameText.right <= nameBox.right + 1,
          columnsFit: nameBox.right <= details.left && details.right <= row.right,
          contentFits: entry.scrollWidth <= entry.clientWidth,
        }
      }),
    )
    expect(geometry.every((row) => row.textFits && row.columnsFit && row.contentFits)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
