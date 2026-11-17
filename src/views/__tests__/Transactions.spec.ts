import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import { routes } from '@/router'
import demo from '@/data/demo.json'

const original = [...demo.transactions]
const screens: ReturnType<typeof mount>[] = []
afterEach(() => {
  screens.splice(0).forEach((screen) => screen.unmount())
  demo.transactions.splice(0, demo.transactions.length, ...original)
})

async function renderApp(path = '/') {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  const screen = mount(App, { global: { plugins: [router] } })
  screens.push(screen)
  await flushPromises()
  return { screen, router }
}

describe('Transactions', () => {
  it.each([
    ['', undefined, 'Emma Richardson'],
    ['?page=1', undefined, 'Emma Richardson'],
    ['?page=3', '3', 'Swift Ride Share'],
    ['?page=999', '5', 'Yuna Kim'],
    ['?page=9999999999999999999999999999', '5', 'Yuna Kim'],
    ['?page=0', undefined, 'Emma Richardson'],
    ['?page=-2', undefined, 'Emma Richardson'],
    ['?page=1.5', undefined, 'Emma Richardson'],
    ['?page=abc', undefined, 'Emma Richardson'],
    ['?page=Infinity', undefined, 'Emma Richardson'],
    ['?page=2&page=3', undefined, 'Emma Richardson'],
    ['?page=', undefined, 'Emma Richardson'],
    ['?page=2e0', undefined, 'Emma Richardson'],
  ])(
    'restores and normalizes page URL %s without adding history',
    async (query, expectedPage, firstName) => {
      const { screen, router } = await renderApp()
      await router.push(`/transactions${query}`)
      await flushPromises()
      expect(router.currentRoute.value.query.page).toBe(expectedPage)
      expect(screen.get('tbody th').text()).toBe(firstName)
      router.back()
      await flushPromises()
      expect(router.currentRoute.value.path).toBe('/')
    },
  )

  it.each([0, 1, 10, 11])(
    'derives pagination for %i supplied records and keeps empty data on page 1',
    async (count) => {
      demo.transactions.splice(count)
      const { screen, router } = await renderApp('/transactions?page=999')
      expect(screen.findAll('tbody tr')).toHaveLength(count > 10 ? 1 : count)
      expect(screen.find('nav[aria-label="Transaction pages"]').exists()).toBe(count > 10)
      expect(router.currentRoute.value.query.page).toBe(count > 10 ? '2' : undefined)
      expect(screen.text().includes('No transactions found')).toBe(count === 0)
    },
  )

  it('preserves unrelated query state when normalizing and navigating', async () => {
    const { screen, router } = await renderApp('/transactions?page=999&other=keep')
    expect(router.currentRoute.value.query).toEqual({ page: '5', other: 'keep' })
    await screen.get('button[aria-label="Page 1"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ other: 'keep' })
  })

  it('browses every page with numbered, Previous and Next actions and restores browser history', async () => {
    const { screen, router } = await renderApp('/transactions')
    const pagination = () => screen.get('nav[aria-label="Transaction pages"]')
    const button = (name: string) => pagination().get(`button[aria-label="${name}"]`)
    const names = () => screen.findAll('tbody th').map((row) => row.text())
    expect(button('Previous page').attributes('disabled')).toBeDefined()
    expect(button('Page 1').attributes('aria-current')).toBe('page')
    await button('Next page').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ page: '2' })
    expect(names()).toEqual([
      'Ella Phillips',
      'Sofia Peterson',
      'Mason Martinez',
      'Green Plate Eatery',
      'Sebastian Cook',
      'William Harris',
      'Elevate Education',
      'Serenity Spa & Wellness',
      'Spark Electric Solutions',
      'Rina Sato',
    ])
    await button('Page 5').trigger('click')
    await flushPromises()
    expect(names()).toEqual([
      'Yuna Kim',
      'Sofia Peterson',
      'Mason Martinez',
      'Sebastian Cook',
      'William Harris',
      'Elevate Education',
      'Serenity Spa & Wellness',
      'Spark Electric Solutions',
      'Swift Ride Share',
    ])
    expect(screen.findAll('tbody time').every((time) => time.text().includes('Jul'))).toBe(true)
    expect(button('Next page').attributes('disabled')).toBeDefined()
    expect(button('Page 5').attributes('aria-current')).toBe('page')
    await button('Previous page').trigger('click')
    await flushPromises()
    expect(names()).toEqual([
      'Emma Richardson',
      'Daniel Carter',
      'Sun Park',
      'Harper Edwards',
      'Liam Hughes',
      'Lily Ramirez',
      'Ethan Clark',
      'Rina Sato',
      'James Thompson',
      'Ella Phillips',
    ])
    await button('Page 4').trigger('click')
    await flushPromises()
    router.back()
    await flushPromises()
    expect(router.currentRoute.value.query.page).toBe('5')
    expect(names()[0]).toBe('Yuna Kim')
    router.back()
    await flushPromises()
    expect(router.currentRoute.value.query.page).toBe('2')
    expect(names()[0]).toBe('Ella Phillips')
    router.forward()
    await flushPromises()
    expect(names()[0]).toBe('Yuna Kim')
    await button('Page 1').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/transactions')
    expect(names()[0]).toBe('Emma Richardson')
  })

  it.each(['navigation', 'View All'])(
    'opens the default page from %s and updates active navigation',
    async (entry) => {
      const { screen, router } = await renderApp()
      const link =
        entry === 'navigation'
          ? screen.get('nav a[aria-label="Transactions"]')
          : screen.get('section[aria-labelledby="transactions-heading"] a')
      await link.trigger('click')
      await flushPromises()
      await vi.waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/transactions'))
      expect(screen.get('h1').text()).toBe('Transactions')
      expect(screen.get('nav a[aria-current="page"]').attributes('aria-label')).toBe('Transactions')
      expect(screen.get('nav a[aria-label="Overview"]').attributes('aria-current')).toBeUndefined()
      expect(screen.findAll('nav[aria-label="Main navigation"] button[disabled]')).toHaveLength(3)
      await screen.get('nav a[aria-label="Overview"]').trigger('click')
      await flushPromises()
      expect(screen.get('h1').text()).toBe('Overview')
      expect(screen.get('nav a[aria-current="page"]').attributes('aria-label')).toBe('Overview')
    },
  )

  it('orders UTC days rather than timestamps, keeps same-day and repeated-name records in supplied order, and leaves Overview unchanged', async () => {
    const base = original[0]!
    demo.transactions.splice(
      0,
      demo.transactions.length,
      { ...base, name: 'Repeated sender', date: '2024-07-31T00:01:00Z', amount: 1 },
      { ...base, name: 'Older record', date: '2024-07-30T23:59:00Z', amount: 2 },
      { ...base, name: 'Repeated sender', date: '2024-07-31T23:59:00Z', amount: 3 },
      { ...base, name: 'Newest record', date: '2024-08-01T00:01:00Z', amount: 4 },
    )
    const { screen, router } = await renderApp('/transactions')
    expect(screen.findAll('tbody tr').map((row) => row.get('th').text())).toEqual([
      'Newest record',
      'Repeated sender',
      'Repeated sender',
      'Older record',
    ])
    expect(screen.findAll('tbody tr').map((row) => row.findAll('td')[2]!.text())).toEqual([
      '+$4.00',
      '+$1.00',
      '+$3.00',
      '+$2.00',
    ])
    expect(screen.findAll('tbody time').map((time) => time.text())).toEqual([
      '01 Aug 2024',
      '31 Jul 2024',
      '31 Jul 2024',
      '30 Jul 2024',
    ])
    await router.push('/')
    await flushPromises()
    const preview = screen.get('[aria-label="Recent transactions"]')
    expect(preview.findAll('h3').map((name) => name.text())).toEqual([
      'Repeated sender',
      'Older record',
      'Repeated sender',
      'Newest record',
    ])
    expect(screen.text()).toContain('$4,836.00')
  })

  it('shows ten dataset records with signed USD amounts, categories and UTC dates', async () => {
    const { screen } = await renderApp('/transactions')
    const rows = screen.findAll('tbody tr')
    expect(rows.map((row) => row.get('th').text())).toEqual([
      'Emma Richardson',
      'Savory Bites Bistro',
      'Daniel Carter',
      'Sun Park',
      'Urban Services Hub',
      'Liam Hughes',
      'Lily Ramirez',
      'Ethan Clark',
      'James Thompson',
      'Pixel Playground',
    ])
    expect(rows.map((row) => row.findAll('td').map((cell) => cell.text()))).toEqual([
      ['General', '19 Aug 2024', '+$75.50'],
      ['Dining Out', '19 Aug 2024', '-$55.50'],
      ['General', '18 Aug 2024', '-$42.30'],
      ['General', '17 Aug 2024', '+$120.00'],
      ['General', '17 Aug 2024', '-$65.00'],
      ['Groceries', '15 Aug 2024', '+$65.75'],
      ['General', '14 Aug 2024', '+$50.00'],
      ['Dining Out', '13 Aug 2024', '-$32.50'],
      ['Entertainment', '11 Aug 2024', '-$5.00'],
      ['Entertainment', '11 Aug 2024', '-$10.00'],
    ])
    expect(rows[0]!.get('time').attributes('datetime')).toBe('2024-08-19')
    expect(rows.every((row) => !row.find('a, button').exists())).toBe(true)
  })
})
