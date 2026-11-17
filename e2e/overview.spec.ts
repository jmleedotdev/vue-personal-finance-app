import { expect, test } from '@playwright/test'

const layouts = [
  { width: 1440, height: 1064, mode: 'desktop' },
  { width: 768, height: 1923, mode: 'tablet' },
  { width: 375, height: 2219, mode: 'mobile' },
  { width: 320, height: 568, mode: 'mobile' },
  { width: 600, height: 800, mode: 'mobile' },
  { width: 900, height: 900, mode: 'tablet' },
  { width: 1280, height: 800, mode: 'desktop' },
] as const

for (const { width, height, mode } of layouts) {
  test(`${mode} navigation and content fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const navigation = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
    await expect(navigation.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(navigation.getByRole('button', { name: 'Transactions' })).toBeDisabled()
    await expect(
      navigation.getByRole('button', { name: 'Transactions' }),
    ).toHaveAccessibleDescription('This section is not available yet.')
    await expect(page.getByRole('button', { name: 'Minimize menu' })).toBeVisible({
      visible: mode === 'desktop',
    })
    const labelVisible = await navigation
      .getByRole('link', { name: 'Overview' })
      .evaluate((link) => link.lastElementChild!.getBoundingClientRect().width > 1)
    expect(labelVisible).toBe(mode !== 'mobile')
    const summaries = await page.locator('dd').evaluateAll((values) =>
      values.map((value) => {
        const range = document.createRange()
        range.selectNodeContents(value)
        const text = range.getBoundingClientRect()
        const card = value.parentElement!.getBoundingClientRect()
        return { y: text.y, fits: text.left >= card.left && text.right <= card.right }
      }),
    )
    expect(summaries).toHaveLength(3)
    expect(summaries.every((summary) => summary.fits)).toBe(true)
    expect(summaries[0]!.y < summaries[1]!.y && summaries[1]!.y < summaries[2]!.y).toBe(
      mode === 'mobile',
    )
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
  })
}

for (const { width, height } of layouts.filter((layout) => layout.mode !== 'desktop')) {
  test(`bottom navigation clears final content and focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    // Exercise the shell with tall content before the later card tickets exist.
    await page.evaluate(() => {
      const main = document.querySelector('main')!
      const spacer = document.createElement('div')
      spacer.style.height = '200vh'
      spacer.style.flexShrink = '0'
      const finalControl = document.createElement('button')
      finalControl.textContent = 'End of content check'
      main.append(spacer, finalControl)
    })
    const finalControl = page.getByRole('button', { name: 'End of content check' })
    // Tab into the final control rather than using a programmatic scroll into view.
    await page.getByRole('region', { name: 'Recent transactions' }).focus()
    await page.keyboard.press('Tab')
    await expect(finalControl).toBeFocused()
    const focusedBox = await finalControl.boundingBox()
    const focusedNavBox = await page
      .getByRole('navigation', { name: 'Main navigation' })
      .boundingBox()
    expect(focusedBox!.y + focusedBox!.height + 4).toBeLessThan(focusedNavBox!.y)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const finalBox = await finalControl.boundingBox()
    const navBox = await page.getByRole('navigation', { name: 'Main navigation' }).boundingBox()
    expect(finalBox!.y + finalBox!.height + 4).toBeLessThan(navBox!.y)
  })
}

test('desktop menu supports keyboard collapse, restore, and refresh reset with local assets', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1064 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const logo = page.getByRole('img', { name: 'finance' })
  await expect(logo).toBeVisible()
  await expect
    .poll(() => logo.evaluate((image) => (image as HTMLImageElement).naturalWidth))
    .toBe(122)
  const menu = page.getByRole('button', { name: 'Minimize menu' })
  await menu.focus()
  await page.keyboard.press('Enter')
  const restore = page.getByRole('button', { name: 'Restore menu' })
  await expect(restore).toBeFocused()
  await expect(restore).toHaveAttribute('aria-expanded', 'false')
  await expect
    .poll(() => logo.evaluate((image) => (image as HTMLImageElement).naturalWidth))
    .toBe(14)
  expect(
    await page
      .locator('img')
      .evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)),
  ).toBe(true)
  expect(await page.evaluate(() => document.fonts.check('14px "Public Sans"'))).toBe(true)
  await page.keyboard.press('Space')
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await menu.click()
  await page.reload()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
})
