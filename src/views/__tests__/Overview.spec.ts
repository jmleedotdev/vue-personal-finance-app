import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import { routes } from '@/router'
import demo from '@/data/demo.json'

const originalTransactions = [...demo.transactions]
const originalBudgets = demo.budgets.map((budget) => ({ ...budget }))
const screens: ReturnType<typeof mount>[] = []
afterEach(() => {
  screens.splice(0).forEach((screen) => screen.unmount())
  demo.transactions.splice(0, demo.transactions.length, ...originalTransactions)
  demo.budgets.splice(0, demo.budgets.length, ...originalBudgets.map((budget) => ({ ...budget })))
  vi.useRealTimers()
})

async function renderOverview() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  await router.push('/')
  const screen = mount(App, { global: { plugins: [createPinia(), router] } })
  screens.push(screen)
  await flushPromises()
  return screen
}

describe('Overview', () => {
  it('shows the three calculated recurring-bill summaries in reference order', async () => {
    const screen = await renderOverview()
    const bills = screen.get('section[aria-labelledby="recurring-bills-heading"]')
    expect(bills.get('h2').text()).toBe('Recurring Bills')
    expect(bills.findAll('dt').map((label) => label.text())).toEqual([
      'Paid Bills',
      'Total Upcoming',
      'Due Soon',
    ])
    expect(bills.findAll('dd').map((amount) => amount.text())).toEqual([
      '$190.00',
      '$194.98',
      '$59.98',
    ])
  })

  it('counts each recurring payee once using its latest payment on or before 19 August', async () => {
    const transaction = originalTransactions[0]!
    demo.transactions.splice(
      0,
      demo.transactions.length,
      ...[
        { name: 'Monthly tuition', date: '2024-08-04T23:59:59Z', amount: -12.34 },
        { name: 'Storage', date: '2024-07-21T10:05:42Z', amount: -5.67 },
        { name: 'Monthly tuition', date: '2024-07-05T11:15:22Z', amount: -10 },
        { name: 'Monthly tuition', date: '2024-08-20T00:00:00Z', amount: -999 },
        { name: 'Storage', date: '2024-06-30T10:05:42Z', amount: -40 },
        { name: 'Future only', date: '2024-08-20T00:00:00Z', amount: -900 },
        { name: 'Not a bill', date: '2024-08-01T00:00:00Z', amount: -800, recurring: false },
      ].map((entry) => ({ ...transaction, recurring: true, ...entry })),
    )
    const screen = await renderOverview()
    const bills = screen.get('section[aria-labelledby="recurring-bills-heading"]')
    expect(bills.findAll('dd').map((amount) => amount.text())).toEqual(['$12.34', '$5.67', '$5.67'])
  })

  it('includes overdue bills, today, and day seven in Due Soon, but not day eight or paid bills', async () => {
    const transaction = originalTransactions[0]!
    demo.transactions.splice(
      0,
      demo.transactions.length,
      ...[
        { name: 'Overdue', date: '2024-06-05T10:00:00Z', amount: -1 },
        { name: 'Due today', date: '2024-07-19T23:59:59Z', amount: -2 },
        { name: 'Seventh day', date: '2024-07-26T23:59:59Z', amount: -4 },
        { name: 'Eighth day', date: '2024-07-27T00:00:00Z', amount: -8 },
        { name: 'Month end', date: '2024-07-31T00:00:00Z', amount: -16 },
        { name: 'Paid today', date: '2024-08-19T23:59:59Z', amount: -32 },
        { name: 'Overdue', date: '2024-08-20T00:00:00Z', amount: -64 },
      ].map((entry) => ({ ...transaction, recurring: true, ...entry })),
    )
    const screen = await renderOverview()
    const bills = screen.get('section[aria-labelledby="recurring-bills-heading"]')
    expect(bills.findAll('dd').map((amount) => amount.text())).toEqual([
      '$32.00',
      '$31.00',
      '$7.00',
    ])
  })

  it.each(['2024-07-15T12:00:00Z', '2030-02-01T12:00:00Z'])(
    'keeps recurring-bill reporting fixed at 19 August 2024 when today is %s',
    async (today) => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(today))
      const screen = await renderOverview()
      const bills = screen.get('section[aria-labelledby="recurring-bills-heading"]')
      expect(bills.findAll('dd').map((amount) => amount.text())).toEqual([
        '$190.00',
        '$194.98',
        '$59.98',
      ])
    },
  )

  it('shows zero bill totals when there are no recurring payments', async () => {
    demo.transactions.splice(
      0,
      demo.transactions.length,
      ...originalTransactions.filter((entry) => !entry.recurring),
    )
    const screen = await renderOverview()
    const bills = screen.get('section[aria-labelledby="recurring-bills-heading"]')
    expect(bills.findAll('dd').map((amount) => amount.text())).toEqual(['$0.00', '$0.00', '$0.00'])
  })

  it.each(['2024-08-04T00:00:00Z', '2024-08-20T00:00:00Z'])(
    'rejects a positive recurring payment dated %s rather than silently omitting it',
    async (date) => {
      demo.transactions.push({
        ...originalTransactions[0]!,
        name: 'Invalid recurring payment',
        recurring: true,
        amount: 10,
        date,
      })
      // Vue warns about the deliberately rejected setup; assert the actual error below.
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        await expect(renderOverview()).rejects.toThrow(
          'Recurring bill payment cannot be positive: Invalid recurring payment',
        )
      } finally {
        warning.mockRestore()
      }
    },
  )

  it('links recurring-bill details to the default page', async () => {
    const screen = await renderOverview()
    const details = screen.get('section[aria-labelledby="recurring-bills-heading"] a')
    expect(details.text()).toBe('See Details')
    expect(details.attributes('href')).toBe('/recurring-bills')
  })

  it('shows August 2024 budget spending, category limits, and a Budgets detail link', async () => {
    const screen = await renderOverview()
    const budgets = screen.get('section[aria-labelledby="budgets-heading"]')
    expect(budgets.get('h2').text()).toBe('Budgets')
    expect(budgets.get('[role="img"]').attributes('aria-label')).toBe(
      'August 2024 budget spending: $338 spent of $975 limit.',
    )
    expect(budgets.findAll('li').map((row) => row.findAll('p').map((text) => text.text()))).toEqual(
      [
        ['Entertainment', '$50.00', 'Spent $15.00 of $50.00 limit.'],
        ['Bills', '$750.00', 'Spent $150.00 of $750.00 limit.'],
        ['Dining Out', '$75.00', 'Spent $133.00 of $75.00 limit.'],
        ['Personal Care', '$100.00', 'Spent $40.00 of $100.00 limit.'],
      ],
    )
    expect(budgets.get('ul[aria-label="Budget categories"]').attributes('tabindex')).toBeUndefined()
    const details = budgets.get('a')
    expect(details.text()).toBe('See Details')
    expect(details.attributes('href')).toBe('/budgets')
  })

  it('keeps extra budget categories reachable in a named keyboard-accessible legend', async () => {
    demo.budgets.push(
      { id: 'budget-travel', category: 'Travel', maximum: 50, theme: '#277C78' },
      { id: 'budget-fitness', category: 'Fitness', maximum: 60, theme: '#82C9D7' },
    )
    const screen = await renderOverview()
    const budgets = screen.get('section[aria-labelledby="budgets-heading"]')
    const legend = budgets.get('ul[aria-label="Budget categories"]')
    expect(legend.findAll('li')).toHaveLength(6)
    expect(
      legend
        .findAll('li')
        .slice(4)
        .map((row) => row.get('p').text()),
    ).toEqual(['Travel', 'Fitness'])
    expect(legend.attributes('tabindex')).toBe('0')
    expect(screen.get(`#${legend.attributes('aria-describedby')}`).text()).toBe(
      'Use arrow keys when focused, swipe, or scroll to reach all budget categories.',
    )
    expect(budgets.get('[role="img"]').attributes('aria-label')).toBe(
      'August 2024 budget spending: $338 spent of $1,085 limit.',
    )
  })

  it.each(['2024-07-15T12:00:00Z', '2030-02-01T12:00:00Z'])(
    'derives only outgoing configured-category August 2024 spending when today is %s',
    async (today) => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(today))
      // Replace the source fixture before rendering, rather than mocking chart internals.
      const transaction = originalTransactions[0]!
      demo.transactions.splice(
        0,
        demo.transactions.length,
        ...[
          { category: 'Entertainment', amount: -12.5, date: '2024-08-01T00:00:00Z' },
          { category: 'Bills', amount: -20.5, date: '2024-08-31T23:59:59Z' },
          { category: 'Dining Out', amount: -3, date: '2024-08-15T12:00:00Z' },
          { category: 'Personal Care', amount: -4, date: '2024-08-15T12:00:00Z' },
          { category: 'Entertainment', amount: 500, date: '2024-08-15T12:00:00Z' },
          { category: 'Bills', amount: -600, date: '2024-07-31T23:59:59Z' },
          { category: 'Bills', amount: -700, date: '2024-09-01T00:00:00Z' },
          { category: 'Bills', amount: -800, date: '2025-08-15T12:00:00Z' },
          { category: 'General', amount: -900, date: '2024-08-15T12:00:00Z' },
        ].map((entry) => ({ ...transaction, ...entry })),
      )
      demo.budgets[0]!.maximum = 80
      const screen = await renderOverview()
      const budgets = screen.get('section[aria-labelledby="budgets-heading"]')
      expect(budgets.get('[role="img"]').attributes('aria-label')).toBe(
        'August 2024 budget spending: $40 spent of $1,005 limit.',
      )
      expect(
        budgets.findAll('li').map((row) => row.findAll('p').map((text) => text.text())),
      ).toEqual([
        ['Entertainment', '$80.00', 'Spent $12.50 of $80.00 limit.'],
        ['Bills', '$750.00', 'Spent $20.50 of $750.00 limit.'],
        ['Dining Out', '$75.00', 'Spent $3.00 of $75.00 limit.'],
        ['Personal Care', '$100.00', 'Spent $4.00 of $100.00 limit.'],
      ])
    },
  )

  it('minimizes and restores the menu while retaining named navigation and balances', async () => {
    const screen = await renderOverview()
    const minimize = screen.get('button[aria-label="Minimize menu"]')
    expect(minimize.attributes('aria-expanded')).toBe('true')
    expect(minimize.attributes('aria-controls')).toBe('main-navigation')
    await minimize.trigger('click')
    const restore = screen.get('button[aria-label="Restore menu"]')
    expect(restore.attributes('aria-expanded')).toBe('false')
    expect(screen.get('a[aria-current="page"]').attributes('aria-label')).toBe('Overview')
    expect(screen.text()).toContain('$4,836.00')
    await restore.trigger('click')
    expect(screen.get('button[aria-label="Minimize menu"]').attributes('aria-expanded')).toBe(
      'true',
    )
  })

  it('marks Overview active and explains why unfinished destinations are unavailable', async () => {
    const screen = await renderOverview()
    const navigation = screen.get('nav[aria-label="Main navigation"]')
    expect(navigation.get('a[aria-current="page"]').text()).toBe('Overview')
    expect(navigation.findAll('a').map((link) => link.attributes('href'))).toEqual([
      '/',
      '/transactions',
      '/budgets',
      '/recurring-bills',
    ])
    for (const label of ['Pots']) {
      const destination = navigation
        .findAll('button')
        .find((button) => button.attributes('aria-label') === label)!
      expect(destination.attributes('disabled')).toBeDefined()
      const description = destination.attributes('aria-describedby')
      expect(screen.get(`#${description}`).text()).toBe('This section is not available yet.')
    }
  })

  it('includes every supplied Pot and Total Saved, not just the first four previews', async () => {
    const screen = await renderOverview()
    const pots = screen.get('section[aria-labelledby="pots-heading"]')
    expect(pots.text()).toContain('Total Saved$920')
    expect(pots.findAll('li').map((pot) => pot.text())).toEqual([
      'Savings$159',
      'Concert Ticket$110',
      'Gift$110',
      'New Laptop$10',
      'Holiday$531',
    ])
  })

  it('names the keyboard-accessible preview and explains its scroll and unavailable detail action', async () => {
    const screen = await renderOverview()
    const pots = screen.get('section[aria-labelledby="pots-heading"]')
    const preview = pots.get('[role="region"][aria-label="Savings pots"]')
    expect(preview.attributes('tabindex')).toBe('0')
    expect(screen.get(`#${preview.attributes('aria-describedby')}`).text()).toContain(
      'Use arrow keys when focused, swipe, or scroll to reach all five pots.',
    )
    expect(preview.text()).not.toContain('Total Saved')
    const details = pots.get('button')
    expect(details.text()).toBe('See Details')
    expect(details.attributes('disabled')).toBeDefined()
    expect(screen.get(`#${details.attributes('aria-describedby')}`).text()).toBe(
      'The Pots page is not available yet.',
    )
    expect(pots.find('a').exists()).toBe(false)
  })

  it('shows ten recent transactions in supplied preview order with signed amounts and calendar dates', async () => {
    const screen = await renderOverview()
    const transactions = screen.get('section[aria-labelledby="transactions-heading"]')
    expect(transactions.get('h2').text()).toBe('Transactions')
    expect(
      transactions.findAll('li').map((row) => ({
        name: row.get('h3').text(),
        amount: row.get('p').text(),
        date: row.get('time').text(),
        calendarDate: row.get('time').attributes('datetime'),
      })),
    ).toEqual([
      {
        name: 'Emma Richardson',
        amount: '+$75.50',
        date: '19 Aug 2024',
        calendarDate: '2024-08-19',
      },
      {
        name: 'Savory Bites Bistro',
        amount: '-$55.50',
        date: '19 Aug 2024',
        calendarDate: '2024-08-19',
      },
      { name: 'Daniel Carter', amount: '-$42.30', date: '18 Aug 2024', calendarDate: '2024-08-18' },
      { name: 'Sun Park', amount: '+$120.00', date: '17 Aug 2024', calendarDate: '2024-08-17' },
      {
        name: 'Urban Services Hub',
        amount: '-$65.00',
        date: '17 Aug 2024',
        calendarDate: '2024-08-17',
      },
      { name: 'Liam Hughes', amount: '+$65.75', date: '15 Aug 2024', calendarDate: '2024-08-15' },
      { name: 'Lily Ramirez', amount: '+$50.00', date: '14 Aug 2024', calendarDate: '2024-08-14' },
      { name: 'Ethan Clark', amount: '-$32.50', date: '13 Aug 2024', calendarDate: '2024-08-13' },
      { name: 'James Thompson', amount: '-$5.00', date: '11 Aug 2024', calendarDate: '2024-08-11' },
      {
        name: 'Pixel Playground',
        amount: '-$10.00',
        date: '11 Aug 2024',
        calendarDate: '2024-08-11',
      },
    ])
  })

  it('links to the full Transactions page and resolves all preview avatars', async () => {
    const screen = await renderOverview()
    const transactions = screen.get('section[aria-labelledby="transactions-heading"]')
    const viewAll = transactions.get('a')
    expect(viewAll.text()).toBe('View All')
    expect(viewAll.attributes('href')).toBe('/transactions')
    expect(transactions.findAll('li img').map((avatar) => avatar.attributes('src'))).toEqual([
      expect.stringContaining('emma-richardson'),
      expect.stringContaining('savory-bites-bistro'),
      expect.stringContaining('daniel-carter'),
      expect.stringContaining('sun-park'),
      expect.stringContaining('urban-services-hub'),
      expect.stringContaining('liam-hughes'),
      expect.stringContaining('lily-ramirez'),
      expect.stringContaining('ethan-clark'),
      expect.stringContaining('james-thompson'),
      expect.stringContaining('pixel-playground'),
    ])
  })

  it('provides a named keyboard-accessible transaction preview with scrolling instructions', async () => {
    const screen = await renderOverview()
    const preview = screen.get('[role="region"][aria-label="Recent transactions"]')
    expect(preview.attributes('tabindex')).toBe('0')
    expect(screen.get(`#${preview.attributes('aria-describedby')}`).text()).toBe(
      'Use arrow keys when focused, swipe, or scroll to reach all ten transactions.',
    )
  })

  it('shows the supplied balance summaries independently of recent transactions', async () => {
    const screen = await renderOverview()
    expect(screen.get('h1').text()).toBe('Overview')
    const summaries = screen
      .findAll('dt')
      .filter((entry) => ['Current Balance', 'Income', 'Expenses'].includes(entry.text()))
      .map((entry) => entry.element.parentElement!.textContent?.trim())
    expect(summaries).toEqual(['Current Balance$4,836.00', 'Income$3,814.25', 'Expenses$1,700.50'])
  })
})
