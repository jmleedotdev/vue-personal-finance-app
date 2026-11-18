import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import { routes } from '@/router'
import demo from '@/data/demo.json'

const originalBudgets = demo.budgets.map((budget) => ({ ...budget }))
const originalTransactions = [...demo.transactions]
const screens: ReturnType<typeof mount>[] = []
afterEach(() => {
  screens.splice(0).forEach((screen) => screen.unmount())
  demo.budgets.splice(0, demo.budgets.length, ...originalBudgets.map((budget) => ({ ...budget })))
  demo.transactions.splice(0, demo.transactions.length, ...originalTransactions)
  vi.useRealTimers()
})

async function renderApp(path = '/budgets') {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  const screen = mount(App, { global: { plugins: [createPinia(), router] } })
  screens.push(screen)
  await flushPromises()
  return { screen, router }
}

describe('Budgets', () => {
  it('shows fewer than three outgoing rows without padding and an empty category without history', async () => {
    demo.budgets.splice(
      0,
      demo.budgets.length,
      { category: 'Travel', maximum: 20, theme: '#277C78' },
      { category: 'Fitness', maximum: 30, theme: '#82C9D7' },
    )
    demo.transactions.splice(0, demo.transactions.length, {
      ...originalTransactions[0]!,
      category: 'Travel',
      name: 'One trip',
      date: '2024-08-31T00:00:00Z',
      amount: -5,
      recurring: false,
    })
    const { screen } = await renderApp()
    const cards = screen.findAll('article')
    expect(cards[0]!.findAll('li')).toHaveLength(1)
    expect(cards[0]!.text()).toContain('One trip')
    expect(cards[1]!.findAll('li')).toHaveLength(0)
    expect(cards[1]!.text()).toContain('No spending yet')
    expect(cards[1]!.findAll('dd').map((amount) => amount.text())).toEqual([
      '$30.00',
      '$0.00',
      '$30.00',
    ])
    expect(cards[1]!.get('a').attributes('href')).toBe('/transactions?category=Fitness')
    expect(
      screen
        .get('[aria-label="Budget categories"]')
        .findAll('li')
        .map((row) => row.text()),
    ).toEqual(['Travel$5.00of $20.00', 'Fitness$0.00of $30.00'])
  })

  it.each(['2024-08-01T00:00:00Z', '2030-01-01T00:00:00Z'])(
    'counts the entire UTC reporting month with cent-safe spending when today is %s',
    async (today) => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(today))
      demo.budgets.splice(0, demo.budgets.length, {
        category: 'Bills',
        maximum: 0.3,
        theme: '#277C78',
      })
      demo.transactions.splice(
        0,
        demo.transactions.length,
        ...[
          { amount: -0.1, date: '2024-08-01T00:00:00Z' },
          { amount: -0.2, date: '2024-08-31T23:59:59Z' },
          { amount: -500, date: '2024-07-31T23:59:59Z' },
          { amount: -600, date: '2024-09-01T00:00:00Z' },
          { amount: -700, date: '2025-08-01T00:00:00Z' },
          { amount: 100, date: '2024-08-15T00:00:00Z' },
          { amount: 0, date: '2024-08-15T00:00:00Z' },
          { amount: -800, date: '2024-08-15T00:00:00Z', category: 'Bills extra' },
        ].map((entry) => ({
          ...originalTransactions[0]!,
          category: 'Bills',
          recurring: false,
          ...entry,
        })),
      )
      const { screen, router } = await renderApp()
      expect(
        screen
          .get('article')
          .findAll('dd')
          .map((amount) => amount.text()),
      ).toEqual(['$0.30', '$0.30', '$0.00'])
      expect(screen.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
      await router.push('/')
      await flushPromises()
      expect(screen.get('section[aria-labelledby="budgets-heading"] li').text()).toContain(
        'Spent $0.30 of $0.30 limit.',
      )
    },
  )

  it('previews the newest three outgoing transactions across months with supplied-order calendar-date ties, and drills down with category only', async () => {
    demo.budgets.splice(0, demo.budgets.length, {
      category: 'Dining Out',
      maximum: 10,
      theme: '#277C78',
    })
    demo.transactions.splice(
      0,
      demo.transactions.length,
      ...[
        { name: 'Older outgoing', date: '2024-07-01T00:00:00Z', amount: -1 },
        { name: 'First tied', date: '2024-09-03T01:00:00Z', amount: -2 },
        { name: 'Second tied', date: '2024-09-03T23:00:00Z', amount: -3 },
        { name: 'Newest outgoing', date: '2024-09-04T00:30:00+02:00', amount: -4 },
        { name: 'Incoming', date: '2024-09-05T00:00:00Z', amount: 5 },
        { name: 'Zero', date: '2024-09-06T00:00:00Z', amount: 0 },
        { name: 'Other category', date: '2024-09-07T00:00:00Z', amount: -6, category: 'Bills' },
      ].map((entry) => ({
        ...originalTransactions[0]!,
        recurring: false,
        category: 'Dining Out',
        ...entry,
      })),
    )
    const { screen, router } = await renderApp('/budgets?search=old&sort=Oldest&page=3')
    const card = screen.get('article')
    expect(card.findAll('li').map((row) => row.get('p').text())).toEqual([
      'First tied',
      'Second tied',
      'Newest outgoing',
    ])
    expect(card.findAll('time').map((date) => date.text())).toEqual([
      '03 Sep 2024',
      '03 Sep 2024',
      '03 Sep 2024',
    ])
    expect(card.findAll('li').map((row) => row.findAll('p')[1]!.text())).toEqual([
      '-$2.00',
      '-$3.00',
      '-$4.00',
    ])
    expect(card.findAll('li img').every((image) => !!image.attributes('src'))).toBe(true)
    await card.get('a').trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/transactions'))
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ category: 'Dining Out' })
    expect(screen.get('input').element.value).toBe('')
    expect(screen.findAll('tbody th').map((row) => row.text())).toEqual([
      'Zero',
      'Incoming',
      'First tied',
      'Second tied',
      'Newest outgoing',
      'Older outgoing',
    ])
  })

  it('shows full Remaining and a working drill-down for incoming-only categories', async () => {
    demo.budgets.splice(0, demo.budgets.length, {
      category: 'Income',
      maximum: 25,
      theme: '#277C78',
    })
    demo.transactions.splice(0, demo.transactions.length, {
      ...originalTransactions[0]!,
      category: 'Income',
      name: 'Only income',
      amount: 10,
      recurring: false,
    })
    const { screen, router } = await renderApp()
    expect(
      screen
        .get('article')
        .findAll('dd')
        .map((amount) => amount.text()),
    ).toEqual(['$25.00', '$0.00', '$25.00'])
    expect(screen.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('0')
    expect(screen.get('article').text()).toContain('No spending yet')
    await screen.get('article a').trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/transactions'))
    expect(router.currentRoute.value.query).toEqual({ category: 'Income' })
    expect(screen.get('tbody th').text()).toBe('Only income')
  })

  it('copies demo budgets once per app, retaining them during navigation but resetting in a fresh instance', async () => {
    const { screen, router } = await renderApp()
    demo.budgets[0]!.maximum = 99
    await router.push('/')
    await flushPromises()
    expect(screen.get('section[aria-labelledby="budgets-heading"] li').text()).toContain('$50.00')
    await router.push('/budgets')
    expect(screen.get('article dd').text()).toBe('$50.00')
    const fresh = await renderApp()
    expect(fresh.screen.get('article dd').text()).toBe('$99.00')
  })

  it('shows a neutral zero chart and invitation on Budgets and coherent Overview totals', async () => {
    demo.budgets.splice(0)
    const { screen, router } = await renderApp()
    expect(screen.get('[role="img"]').attributes('aria-label')).toBe(
      'August 2024 budget spending: $0 spent of $0 limit.',
    )
    expect(screen.get('[role="img"]').findAll('path')).toHaveLength(0)
    expect(screen.text()).toContain('No budgets yet')
    expect(screen.text()).toContain('Add a budget to start tracking')
    expect(screen.findAll('article')).toHaveLength(0)
    await router.push('/')
    await flushPromises()
    expect(
      screen
        .get('section[aria-labelledby="budgets-heading"] [role="img"]')
        .attributes('aria-label'),
    ).toBe('August 2024 budget spending: $0 spent of $0 limit.')
  })

  it('opens from Overview and navigation, showing ordered demo spending and overspending', async () => {
    const { screen, router } = await renderApp('/')
    await screen.get('section[aria-labelledby="budgets-heading"] a').trigger('click')
    await flushPromises()
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/budgets'))
    expect(screen.get('nav a[aria-current="page"]').attributes('aria-label')).toBe('Budgets')
    expect(screen.get('a[href="#main-content"]').text()).toBe('Skip to content')
    expect(screen.get('#main-content').attributes('tabindex')).toBe('-1')
    expect(screen.get('[role="img"]').attributes('aria-label')).toBe(
      'August 2024 budget spending: $338 spent of $975 limit.',
    )
    expect(screen.findAll('article h2').map((heading) => heading.text())).toEqual([
      'Entertainment',
      'Bills',
      'Dining Out',
      'Personal Care',
    ])
    expect(
      screen.findAll('article').map((card) => card.findAll('dd').map((value) => value.text())),
    ).toEqual([
      ['$50.00', '$15.00', '$35.00'],
      ['$750.00', '$150.00', '$600.00'],
      ['$75.00', '$133.00', '$0.00'],
      ['$100.00', '$40.00', '$60.00'],
    ])
    expect(
      screen.findAll('[role="progressbar"]').map((bar) => bar.attributes('aria-valuenow')),
    ).toEqual(['30', '20', '100', '40'])
    expect(screen.findAll('article button')).toHaveLength(0)
    expect(screen.get('nav button[aria-label="Pots"]').attributes('disabled')).toBeDefined()
    await screen.get('nav a[aria-label="Overview"]').trigger('click')
    await flushPromises()
    await screen.get('nav a[aria-label="Budgets"]').trigger('click')
    await flushPromises()
    expect(screen.get('h1').text()).toBe('Budgets')
  })
})
