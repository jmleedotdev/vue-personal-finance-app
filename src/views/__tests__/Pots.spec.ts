import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import { routes } from '@/router'
import demo from '@/data/demo.json'

const originalPots = demo.pots.map((pot) => ({ ...pot }))
const screens: ReturnType<typeof mount>[] = []
afterEach(() => {
  screens.splice(0).forEach((screen) => screen.unmount())
  demo.pots.splice(0, demo.pots.length, ...originalPots.map((pot) => ({ ...pot })))
})

async function renderApp(path = '/') {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  const screen = mount(App, { global: { plugins: [createPinia(), router] } })
  screens.push(screen)
  await flushPromises()
  return { screen, router }
}

it('shows zero, exact-target and over-target cents truthfully with capped accessible progress', async () => {
  demo.pots.splice(
    0,
    demo.pots.length,
    { id: 'empty', name: 'Empty', total: 0, target: 100, theme: '#277C78' },
    { id: 'exact', name: 'Exact', total: 12.34, target: 12.34, theme: '#626070' },
    { id: 'over', name: 'Over', total: 150.75, target: 100.5, theme: '#82C9D7' },
    { id: 'fourth', name: 'Fourth', total: 1, target: 10, theme: '#F2CDAC' },
    { id: 'outside', name: 'Outside preview', total: 100, target: 200, theme: '#826CB0' },
  )
  const { screen, router } = await renderApp('/pots')
  const cards = screen.findAll('article')
  expect(cards.slice(0, 3).map((card) => card.get('dd').text())).toEqual([
    '$0.00',
    '$12.34',
    '$150.75',
  ])
  expect(
    cards.slice(0, 3).map((card) => card.get('[role="progressbar"]').attributes('aria-valuenow')),
  ).toEqual(['0', '100', '100'])
  expect(cards[2]!.text()).toContain('150%')
  expect(cards[2]!.text()).toContain('Target of $100.50')
  expect(cards[2]!.get('[role="progressbar"]').attributes('aria-valuetext')).toBe(
    '150% saved toward target of $100.50',
  )
  await router.push('/')
  await flushPromises()
  const summary = screen.get('section[aria-labelledby="pots-heading"]')
  expect(summary.text()).toContain('Total Saved$264')
  expect(summary.findAll('li')).toHaveLength(5)
  expect(screen.get('#pots-scroll-help').text()).toContain('reach all pots.')
  expect(screen.get('[aria-label="Balance summaries"]').text()).toBe(
    'Current Balance$4,836.00Income$3,814.25Expenses$1,700.50',
  )
})

it('retains copied session finances across routes and restores bundled finances in a fresh instance', async () => {
  const { screen, router } = await renderApp('/pots')
  const firstHeadingId = screen.get('article h2').attributes('id')
  // Changing the source after initialization must not change the running session.
  demo.pots[0]!.name = 'Changed source'
  demo.pots[0]!.total = 999
  await router.push('/')
  await flushPromises()
  expect(screen.get('section[aria-labelledby="pots-heading"]').text()).toContain('Savings$159')
  expect(screen.get('section[aria-labelledby="pots-heading"]').text()).toContain('Total Saved$920')
  await router.push('/pots')
  await flushPromises()
  expect(screen.get('article h2').attributes('id')).toBe(firstHeadingId)
  expect(screen.get('article dd').text()).toBe('$159.00')
  demo.pots.splice(0, demo.pots.length, ...originalPots.map((pot) => ({ ...pot })))
  const fresh = await renderApp('/pots')
  expect(fresh.screen.get('article dd').text()).toBe('$159.00')
  expect(fresh.screen.get('article h2').text()).toBe('Savings')
})

it('opens Pots from Overview and navigation with original ordered finances and active routes', async () => {
  const original = structuredClone(demo)
  const { screen, router } = await renderApp()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toContain(
    'Current Balance$4,836.00',
  )
  const summary = screen.get('section[aria-labelledby="pots-heading"]')
  expect(summary.text()).toContain('Total Saved$920')
  await summary.get('a').trigger('click')
  await flushPromises()
  await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/pots'))
  await flushPromises()
  expect(screen.get('nav a[aria-current="page"]').attributes('aria-label')).toBe('Pots')
  expect(screen.findAll('article h2').map((heading) => heading.text())).toEqual([
    'Savings',
    'Concert Ticket',
    'Gift',
    'New Laptop',
    'Holiday',
  ])
  expect(screen.findAll('article dd').map((value) => value.text())).toEqual([
    '$159.00',
    '$110.00',
    '$110.00',
    '$10.00',
    '$531.00',
  ])
  expect(screen.get('article').text()).toContain('7.95%')
  expect(screen.get('article').text()).toContain('Target of $2,000.00')
  expect(
    screen.findAll('main button').every((button) => button.attributes('disabled') !== undefined),
  ).toBe(true)
  await screen.get('nav a[aria-label="Overview"]').trigger('click')
  await flushPromises()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toContain(
    'Current Balance$4,836.00',
  )
  await screen.get('nav a[aria-label="Pots"]').trigger('click')
  await flushPromises()
  expect(screen.get('h1').text()).toBe('Pots')
  expect(demo).toEqual(original)
})
