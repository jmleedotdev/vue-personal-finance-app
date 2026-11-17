import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import HomeView from '@/views/HomeView.vue'

const screens: ReturnType<typeof mount>[] = []
afterEach(() => screens.splice(0).forEach((screen) => screen.unmount()))

async function renderOverview() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: HomeView }],
  })
  await router.push('/')
  const screen = mount(App, { global: { plugins: [router] } })
  screens.push(screen)
  await flushPromises()
  return screen
}

describe('Overview', () => {
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

  it('marks Overview active and explains why other destinations are unavailable', async () => {
    const screen = await renderOverview()
    const navigation = screen.get('nav[aria-label="Main navigation"]')
    expect(navigation.get('a[aria-current="page"]').text()).toBe('Overview')
    expect(navigation.findAll('a').map((link) => link.attributes('href'))).toEqual(['/'])
    for (const label of ['Transactions', 'Budgets', 'Pots', 'Recurring Bills']) {
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

  it('explains that the full Transactions page is unavailable without offering an enabled link', async () => {
    const screen = await renderOverview()
    const transactions = screen.get('section[aria-labelledby="transactions-heading"]')
    const viewAll = transactions.get('button')
    expect(viewAll.text()).toBe('View All')
    expect(viewAll.attributes('disabled')).toBeDefined()
    expect(screen.get(`#${viewAll.attributes('aria-describedby')}`).text()).toBe(
      'The Transactions page is not available yet.',
    )
    expect(transactions.find('a').exists()).toBe(false)
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
    const summaries = screen.findAll('dl > div').map((entry) => entry.text())
    expect(summaries).toEqual(['Current Balance$4,836.00', 'Income$3,814.25', 'Expenses$1,700.50'])
  })
})
