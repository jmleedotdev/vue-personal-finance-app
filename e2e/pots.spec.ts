import { expect, test } from '@playwright/test'

for (const { width, height } of [
  { width: 1440, height: 1125 },
  { width: 768, height: 1907 },
  { width: 375, height: 1869 },
  { width: 320, height: 480 },
  { width: 600, height: 600 },
  { width: 900, height: 600 },
  { width: 1280, height: 480 },
]) {
  test(`Pots browsing fits ${width}x${height}`, async ({ page }, testInfo) => {
    const failedAssets: string[] = []
    page.on('response', (response) => {
      if (response.status() >= 400) failedAssets.push(response.url())
    })
    await page.setViewportSize({ width, height })
    await page.goto('/pots')
    await page.evaluate(() => document.fonts.ready)
    const navigation = page.getByRole('navigation', { name: 'Main navigation' })
    const potsLink = navigation.getByRole('link', { name: 'Pots', exact: true })
    await expect(potsLink).toHaveAttribute('aria-current', 'page')
    await expect(page.locator('article h2')).toHaveText([
      'Savings',
      'Concert Ticket',
      'Gift',
      'New Laptop',
      'Holiday',
    ])
    await expect(page.locator('article dd')).toHaveText([
      '$159.00',
      '$110.00',
      '$110.00',
      '$10.00',
      '$531.00',
    ])
    await expect(page.getByRole('button', { name: 'Add New Pot', exact: true })).toBeEnabled()
    for (const button of await page.locator('article button').all())
      await expect(button).toBeDisabled()
    const cards = await page.locator('article').evaluateAll((articles) =>
      articles.map((article) => {
        const box = article.getBoundingClientRect()
        return { x: box.x, y: box.y, right: box.right }
      }),
    )
    expect(cards[0]!.y === cards[1]!.y).toBe(width >= 1280)
    expect(cards.every((card) => card.x >= 0 && card.right <= width)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await potsLink.focus()
    await expect(potsLink).toBeFocused()
    expect(await potsLink.evaluate((link) => getComputedStyle(link).outlineStyle)).not.toBe('none')
    await potsLink.hover()
    await expect(potsLink).toHaveAttribute('aria-current', 'page')
    expect(
      await page
        .locator('img')
        .evaluateAll((images) =>
          images.every(
            (image) =>
              image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
          ),
        ),
    ).toBe(true)
    expect(await page.evaluate(() => document.fonts.check('14px "Public Sans"'))).toBe(true)
    expect(failedAssets).toEqual([])
    await page.mouse.move(0, 0)
    await potsLink.blur()
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: testInfo.outputPath('pots.png'), fullPage: true })
  })
}

for (const width of [320, 375, 600, 768, 900]) {
  test(`last Pot clears fixed navigation in a short ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 480 })
    await page.goto('/pots')
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const navBox = (await page.getByRole('navigation', { name: 'Main navigation' }).boundingBox())!
    const lastCard = (await page.locator('article').last().boundingBox())!
    expect(lastCard.y + lastCard.height + 4).toBeLessThan(navBox.y)
    await expect(page.getByRole('heading', { name: 'Holiday', exact: true })).toBeInViewport()
  })
}

test('Pots stays current when the desktop menu is minimized and restored', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 600 })
  await page.goto('/pots')
  const link = page.getByRole('navigation').getByRole('link', { name: 'Pots', exact: true })
  await page.getByRole('button', { name: 'Minimize menu' }).click()
  await expect(link).toHaveAttribute('aria-current', 'page')
  await page.getByRole('button', { name: 'Restore menu' }).click()
  await expect(link).toHaveAttribute('aria-current', 'page')
})

test('opens Pots by keyboard from Overview, navigates back and reloads original finances', async ({
  page,
}) => {
  await page.goto('/')
  const summary = page.getByRole('region', { name: 'Pots', exact: true })
  const details = summary.getByRole('link', { name: 'See Details' })
  await details.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/pots')
  await expect(page.getByRole('heading', { name: 'Pots', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.locator('article dd').first()).toHaveText('$159.00')
  await page.getByRole('navigation').getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(summary.getByText('$920', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Balance summaries')).toContainText('Current Balance$4,836.00')
  await page.goBack()
  await expect(page).toHaveURL('/pots')
  await expect(
    page.getByRole('navigation').getByRole('link', { name: 'Pots', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
})
