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
      expect(screen.findAll('nav button[disabled]')).toHaveLength(3)
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
    expect(
      screen
        .find(
          'main button:not([disabled]), main input:not([disabled]), main select:not([disabled])',
        )
        .exists(),
    ).toBe(false)
    expect(rows.every((row) => !row.find('a, button').exists())).toBe(true)
  })
})
