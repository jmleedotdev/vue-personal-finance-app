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
  vi.useRealTimers()
})

async function renderApp(path = '/recurring-bills') {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  const screen = mount(App, { global: { plugins: [router] } })
  screens.push(screen)
  await flushPromises()
  return { screen, router }
}

describe('Recurring Bills', () => {
  it.each(['navigation', 'See Details'])(
    'opens the default page from %s with current navigation',
    async (entry) => {
      const { screen, router } = await renderApp('/')
      const link =
        entry === 'navigation'
          ? screen.get('nav a[aria-label="Recurring Bills"]')
          : screen.get('section[aria-labelledby="recurring-bills-heading"] a')
      await link.trigger('click')
      await vi.waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/recurring-bills'))
      await flushPromises()
      expect(screen.get('h1').text()).toBe('Recurring Bills')
      expect(screen.get('nav a[aria-current="page"]').attributes('aria-label')).toBe(
        'Recurring Bills',
      )
      expect(screen.get('main').attributes('id')).toBe('main-content')
      expect(screen.get('a[href="#main-content"]').text()).toBe('Skip to content')
      expect(
        screen.findAll('nav button[disabled]').map((button) => button.attributes('aria-label')),
      ).toEqual(['Budgets', 'Pots'])
      await screen.get('nav a[aria-label="Overview"]').trigger('click')
      await flushPromises()
      expect(screen.get('h1').text()).toBe('Overview')
    },
  )

  it('selects the latest eligible payment independently of history order, retains exact payees and stable due-date ties', async () => {
    const base = original[0]!
    demo.transactions.splice(
      0,
      demo.transactions.length,
      ...[
        { name: 'Storage', date: '2024-07-21T12:00:00Z', amount: -5.67 },
        { name: 'Tuition', date: '2024-08-04T23:59:59Z', amount: -12.34 },
        { name: 'Storage', date: '2024-06-30T00:00:00Z', amount: -40 },
        { name: 'Tuition', date: '2024-07-05T00:00:00Z', amount: -10 },
        { name: 'Storage', date: '2024-08-20T00:00:00Z', amount: -999 },
        { name: 'Tuition', date: '2024-08-31T00:00:00Z', amount: -999 },
        { name: 'Future only', date: '2024-08-20T00:00:00Z', amount: -900 },
        { name: 'storage', date: '2024-07-21T12:00:00Z', amount: -0.1 },
        { name: 'Not recurring', date: '2024-08-01T00:00:00Z', amount: -800, recurring: false },
      ].map((entry) => ({ ...base, recurring: true, ...entry })),
    )
    const { screen, router } = await renderApp()
    const rows = screen.findAll('tbody tr')
    expect(rows.map((row) => row.get('th').text())).toEqual(['Tuition', 'Storage', 'storage'])
    expect(rows.map((row) => row.get('time').text())).toEqual([
      'Monthly - 4th',
      'Monthly - 21st',
      'Monthly - 21st',
    ])
    expect(rows.map((row) => row.findAll('td')[1]!.text())).toEqual(['$12.34', '$5.67', '$0.10'])
    expect(rows[0]!.get('img').attributes('src')).toBeTruthy()
    expect(screen.get('section[aria-labelledby="total-bills-heading"] dd').text()).toBe('$18.11')
    expect(
      screen.findAll('section[aria-labelledby="bill-summary-heading"] dd').map((dd) => dd.text()),
    ).toEqual(['1 ($12.34)', '2 ($5.77)', '2 ($5.77)'])
    await router.push('/')
    await flushPromises()
    expect(
      screen
        .findAll('section[aria-labelledby="recurring-bills-heading"] dd')
        .map((dd) => dd.text()),
    ).toEqual(['$12.34', '$5.77', '$5.77'])
  })

  it('includes overdue, today and day seven but not day eight or next-month paid recurrences, using entire UTC reporting day', async () => {
    demo.transactions.splice(
      0,
      demo.transactions.length,
      ...[
        { name: 'Overdue', date: '2024-06-05T10:00:00Z', amount: -1 },
        { name: 'Today', date: '2024-07-19T23:59:59Z', amount: -2 },
        { name: 'Seven', date: '2024-07-26T23:59:59Z', amount: -4 },
        { name: 'Eight', date: '2024-07-27T00:00:00Z', amount: -8 },
        { name: 'Month end', date: '2024-07-31T00:00:00Z', amount: -16 },
        { name: 'Paid today', date: '2024-08-19T23:59:59Z', amount: -32 },
        { name: 'Paid early', date: '2024-08-01T00:00:00Z', amount: -64 },
        { name: 'UTC eligible', date: '2024-08-20T01:00:00+02:00', amount: -128 },
        { name: 'UTC future', date: '2024-08-19T23:00:00-02:00', amount: -256 },
      ].map((entry) => ({ ...original[0]!, recurring: true, ...entry })),
    )
    const { screen } = await renderApp()
    expect(
      screen
        .findAll('tbody tr')
        .map((row) => [row.get('th').text(), row.get('[aria-label]').attributes('aria-label')]),
    ).toEqual([
      ['Paid early', 'Paid'],
      ['Overdue', 'Due Soon'],
      ['Today', 'Due Soon'],
      ['Paid today', 'Paid'],
      ['UTC eligible', 'Paid'],
      ['Seven', 'Due Soon'],
      ['Eight', 'Upcoming'],
      ['Month end', 'Upcoming'],
    ])
    expect(
      screen.findAll('section[aria-labelledby="bill-summary-heading"] dd').map((dd) => dd.text()),
    ).toEqual(['3 ($224.00)', '5 ($31.00)', '3 ($7.00)'])
    expect(screen.get('section[aria-labelledby="total-bills-heading"] dd').text()).toBe('$255.00')
  })

  it.each(['2024-07-15T12:00:00Z', '2030-02-01T12:00:00Z'])(
    'keeps the Reporting Date fixed when today is %s',
    async (today) => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(today))
      const { screen } = await renderApp()
      expect(screen.get('section[aria-labelledby="total-bills-heading"] dd').text()).toBe('$384.98')
      expect(
        screen.findAll('section[aria-labelledby="bill-summary-heading"] dd').map((dd) => dd.text()),
      ).toEqual(['4 ($190.00)', '4 ($194.98)', '2 ($59.98)'])
    },
  )

  it.each(['2024-08-04T00:00:00Z', '2024-08-20T00:00:00Z'])(
    'rejects positive recurring payments even on future date %s',
    async (date) => {
      demo.transactions.push({
        ...original[0]!,
        name: 'Invalid bill',
        recurring: true,
        amount: 10,
        date,
      })
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        await expect(renderApp()).rejects.toThrow(
          'Recurring bill payment cannot be positive: Invalid bill',
        )
      } finally {
        warning.mockRestore()
      }
    },
  )

  it('shows zero counts and totals and No bills found without recurring history', async () => {
    demo.transactions.splice(
      0,
      demo.transactions.length,
      ...original.filter((entry) => !entry.recurring),
    )
    const { screen } = await renderApp()
    expect(screen.get('section[aria-labelledby="total-bills-heading"] dd').text()).toBe('$0.00')
    expect(
      screen.findAll('section[aria-labelledby="bill-summary-heading"] dd').map((dd) => dd.text()),
    ).toEqual(['0 ($0.00)', '0 ($0.00)', '0 ($0.00)'])
    expect(screen.findAll('tbody tr')).toHaveLength(0)
    expect(screen.get('section[aria-label="Monthly recurring bills"] p').text()).toBe(
      'No bills found',
    )
  })

  it('shows eight distinct monthly bills in Oldest order with calculated totals and accessible statuses', async () => {
    const { screen } = await renderApp()
    expect(screen.get('h1').text()).toBe('Recurring Bills')
    expect(screen.get('section[aria-labelledby="total-bills-heading"] dd').text()).toBe('$384.98')
    expect(
      screen
        .findAll('section[aria-labelledby="bill-summary-heading"] dd')
        .map((item) => item.text()),
    ).toEqual(['4 ($190.00)', '4 ($194.98)', '2 ($59.98)'])
    const rows = screen.findAll('tbody tr')
    expect(rows.map((row) => row.get('th').text())).toEqual([
      'Spark Electric Solutions',
      'Serenity Spa & Wellness',
      'Elevate Education',
      'Pixel Playground',
      'Nimbus Data Storage',
      'ByteWise',
      'EcoFuel Energy',
      'Aqua Flow Utilities',
    ])
    expect(rows.map((row) => row.get('time').text())).toEqual([
      'Monthly - 2nd',
      'Monthly - 3rd',
      'Monthly - 4th',
      'Monthly - 11th',
      'Monthly - 21st',
      'Monthly - 23rd',
      'Monthly - 29th',
      'Monthly - 30th',
    ])
    expect(rows.map((row) => row.get('[aria-label]').attributes('aria-label'))).toEqual([
      'Paid',
      'Paid',
      'Paid',
      'Paid',
      'Due Soon',
      'Due Soon',
      'Upcoming',
      'Upcoming',
    ])
    expect(rows.map((row) => row.findAll('td')[1]!.text())).toEqual([
      '$100.00',
      '$30.00',
      '$50.00',
      '$10.00',
      '$9.99',
      '$49.99',
      '$35.00',
      '$100.00',
    ])
    expect(screen.find('input, [role="combobox"]').exists()).toBe(false)
  })
})
