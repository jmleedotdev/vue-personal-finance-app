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

  it('shows the supplied balance summaries independently of recent transactions', async () => {
    const screen = await renderOverview()
    expect(screen.get('h1').text()).toBe('Overview')
    const summaries = screen.findAll('dl > div').map((entry) => entry.text())
    expect(summaries).toEqual(['Current Balance$4,836.00', 'Income$3,814.25', 'Expenses$1,700.50'])
  })
})
