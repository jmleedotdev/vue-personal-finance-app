import { expect, test } from '@playwright/test'

test('bill sort has responsive triggers, keyboard focus and no scrolling side effects', async ({
  page,
}, testInfo) => {
  await page.goto('/recurring-bills')
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 1024 })
    const control = page.getByRole('combobox', { name: 'Sort bills' })
    await control.scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollBy(0, -100))
    await control.hover()
    await control.focus()
    await expect(control).toBeFocused()
    const scrollY = await page.evaluate(() => window.scrollY)
    // The same control shows a field on larger layouts and only the local icon on mobile.
    expect((await control.boundingBox())!.width > 100).toBe(width >= 768)
    await control.press('Enter')
    const menu = page.getByRole('listbox', { name: 'Sort by' })
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('option', { selected: true })).toHaveText('Oldest')
    const bounds = (await menu.boundingBox())!
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(1024)
    await menu.getByRole('option', { name: 'Highest', exact: true }).hover()
    await page.screenshot({ path: testInfo.outputPath(`sort-open-${width}.png`) })
    await control.press('Home')
    await control.press('Enter')
    await expect(control).toBeFocused()
    await expect(menu).toBeHidden()
    await expect(page).toHaveURL('/recurring-bills?sort=Latest')
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY)
    await control.press('Enter')
    await control.press('End')
    await control.press('Escape')
    await expect(menu).toBeHidden()
    await expect(control).toBeFocused()
    await expect(page).toHaveURL('/recurring-bills?sort=Latest')
    await control.click()
    await page
      .getByRole('heading', { name: 'Recurring Bills', exact: true })
      .dispatchEvent('pointerdown')
    await expect(menu).toBeHidden()
    await control.press('Enter')
    await menu.getByRole('option', { name: 'Oldest', exact: true }).click()
    await expect(control).toBeFocused()
    await expect(page).toHaveURL('/recurring-bills')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`sort-closed-${width}.png`) })
  }
})
