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
  const screen = mount(App, { attachTo: document.body, global: { plugins: [router] } })
  screens.push(screen)
  await flushPromises()
  return { screen, router }
}

async function choose(screen: ReturnType<typeof mount>, label: string, value: string) {
  const control = screen
    .findAll('[role="combobox"]')
    .find((item) => item.attributes('aria-label') === label)!
  await control.trigger('click')
  await screen
    .findAll('[role="option"]')
    .find((item) => item.text() === value)!
    .trigger('click')
  await flushPromises()
}

describe('Transactions', () => {
  it('combines applied search, category, sorting and pagination while ignoring drafts and restoring history', async () => {
    const { screen, router } = await renderApp('/transactions?search=a&page=2')
    const input = screen.get('input')
    await input.setValue('unsubmitted')
    await choose(screen, 'Filter by category', 'General')
    expect(router.currentRoute.value.query).toEqual({ search: 'a', category: 'General' })
    expect(screen.findAll('tbody tr')).toHaveLength(10)
    await screen.get('button[aria-label="Next page"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ search: 'a', category: 'General', page: '2' })
    await input.setValue('another draft')
    await choose(screen, 'Sort transactions', 'Lowest')
    expect(router.currentRoute.value.query).toEqual({
      search: 'a',
      category: 'General',
      sort: 'Lowest',
    })
    expect(screen.get('tbody th').text()).toBe('Urban Services Hub')
    await input.setValue('Emma')
    await screen.get('form').trigger('submit')
    await flushPromises()
    expect(screen.findAll('tbody th').map((row) => row.text())).toEqual([
      'Emma Richardson',
      'Emma Richardson',
    ])
    await choose(screen, 'Filter by category', 'Bills')
    expect(screen.text()).toContain('No transactions found')
    expect(screen.find('nav[aria-label="Transaction pages"]').exists()).toBe(false)
    expect(screen.findAll('[role="combobox"]')).toHaveLength(2)
    expect(screen.text()).not.toContain('Clear filters')
    await input.setValue(' ')
    await screen.get('form').trigger('submit')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ category: 'Bills', sort: 'Lowest' })
    expect(screen.findAll('tbody tr')).toHaveLength(7)
    await input.setValue('discard me')
    router.back()
    await flushPromises()
    expect((input.element as HTMLInputElement).value).toBe('Emma')
    expect(screen.text()).toContain('No transactions found')
    router.back()
    await flushPromises()
    expect(screen.findAll('tbody th').map((row) => row.text())).toEqual([
      'Emma Richardson',
      'Emma Richardson',
    ])
    expect(screen.get('[aria-label="Filter by category"]').text()).toContain('General')
    router.forward()
    await flushPromises()
    expect(screen.text()).toContain('No transactions found')
  })

  it.each([
    ['?category=unknown&sort=nope&page=99', {}, 'Yuna Kim', '5'],
    [
      '?category=Education&sort=Oldest&page=99',
      { category: 'Education', sort: 'Oldest' },
      'Elevate Education',
      undefined,
    ],
    ['?category=&sort=Latest&page=1', {}, 'Emma Richardson', undefined],
    [
      '?category=Bills&category=General&sort=Lowest&sort=Highest&page=-2',
      {},
      'Emma Richardson',
      undefined,
    ],
  ])(
    'restores and normalizes category/sort URLs: %s',
    async (query, constraints, firstName, page) => {
      const { screen, router } = await renderApp(`/transactions${query}`)
      expect(router.currentRoute.value.query).toEqual({ ...constraints, ...(page ? { page } : {}) })
      expect(screen.get('tbody th').text()).toBe(firstName)
      expect(screen.get('[aria-label="Sort transactions"]').text()).toContain(
        'sort' in constraints ? constraints.sort : 'Latest',
      )
      expect(screen.get('[aria-label="Filter by category"]').text()).toContain(
        'category' in constraints ? constraints.category : 'All Transactions',
      )
    },
  )

  it('orders constrained records before taking a page and restores controls with memory history', async () => {
    const { screen, router } = await renderApp('/transactions?category=General&sort=Lowest&page=2')
    expect(screen.findAll('tbody th').map((row) => row.text())).toEqual(['Buzz Marketing Group'])
    await choose(screen, 'Sort transactions', 'Highest')
    expect(router.currentRoute.value.query).toEqual({ category: 'General', sort: 'Highest' })
    await choose(screen, 'Filter by category', 'All Transactions')
    expect(router.currentRoute.value.query).toEqual({ sort: 'Highest' })
    router.back()
    await flushPromises()
    expect(screen.get('[aria-label="Filter by category"]').text()).toContain('General')
    router.back()
    await flushPromises()
    expect(screen.get('[aria-label="Sort transactions"]').text()).toContain('Lowest')
    expect(screen.find('[aria-current="page"][aria-label="Page 2"]').exists()).toBe(true)
    router.forward()
    await flushPromises()
    expect(screen.get('tbody th').text()).toBe('Buzz Marketing Group')
    await choose(screen, 'Sort transactions', 'Latest')
    expect(router.currentRoute.value.query).toEqual({ category: 'General' })
  })
  it.each([
    ['Latest', ['Beta|+$75.50', 'Alpha|-$5.00', 'Alpha|-$100.00', 'Zulu|-$5.00']],
    ['Oldest', ['Zulu|-$5.00', 'Beta|+$75.50', 'Alpha|-$5.00', 'Alpha|-$100.00']],
    ['A to Z', ['Alpha|-$5.00', 'Alpha|-$100.00', 'Beta|+$75.50', 'Zulu|-$5.00']],
    ['Z to A', ['Zulu|-$5.00', 'Beta|+$75.50', 'Alpha|-$5.00', 'Alpha|-$100.00']],
    ['Highest', ['Beta|+$75.50', 'Alpha|-$5.00', 'Zulu|-$5.00', 'Alpha|-$100.00']],
    ['Lowest', ['Alpha|-$100.00', 'Alpha|-$5.00', 'Zulu|-$5.00', 'Beta|+$75.50']],
  ])('sorts by %s with stable same-day, name and signed-amount ties', async (sort, expected) => {
    const base = original[0]!
    demo.transactions.splice(
      0,
      demo.transactions.length,
      { ...base, name: 'Beta', amount: 75.5, date: '2024-08-02T01:00:00Z' },
      { ...base, name: 'Alpha', amount: -5, date: '2024-08-02T23:00:00Z' },
      { ...base, name: 'Alpha', amount: -100, date: '2024-08-02T12:00:00Z' },
      { ...base, name: 'Zulu', amount: -5, date: '2024-08-01T23:59:00Z' },
    )
    const { screen, router } = await renderApp('/transactions')
    await screen.get('[role="combobox"][aria-label="Sort transactions"]').trigger('click')
    expect(screen.findAll('[role="option"]').map((option) => option.text())).toEqual([
      'Latest',
      'Oldest',
      'A to Z',
      'Z to A',
      'Highest',
      'Lowest',
    ])
    await screen
      .findAll('[role="option"]')
      .find((option) => option.text() === sort)!
      .trigger('click')
    await flushPromises()
    expect(
      screen
        .findAll('tbody tr')
        .map((row) => `${row.get('th').text()}|${row.get('.transaction-amount').text()}`),
    ).toEqual(expected)
    expect(router.currentRoute.value.query).toEqual(sort === 'Latest' ? {} : { sort })
  })
  it('offers every transaction category alphabetically and applies only one before pagination', async () => {
    const { screen, router } = await renderApp('/transactions?page=3')
    await screen.get('[role="combobox"][aria-label="Filter by category"]').trigger('click')
    expect(screen.findAll('[role="option"]').map((option) => option.text())).toEqual([
      'All Transactions',
      'Bills',
      'Dining Out',
      'Education',
      'Entertainment',
      'General',
      'Groceries',
      'Lifestyle',
      'Personal Care',
      'Shopping',
      'Transportation',
    ])
    await screen
      .findAll('[role="option"]')
      .find((option) => option.text() === 'Education')!
      .trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ category: 'Education' })
    expect(screen.findAll('tbody th').map((row) => row.text())).toEqual([
      'Elevate Education',
      'Elevate Education',
    ])
    expect(screen.find('nav[aria-label="Transaction pages"]').exists()).toBe(false)
    await choose(screen, 'Filter by category', 'General')
    expect(
      screen.findAll('tbody td.transaction-category').every((cell) => cell.text() === 'General'),
    ).toBe(true)
    expect(screen.findAll('tbody tr')).toHaveLength(10)
    expect(screen.find('nav[aria-label="Transaction pages"]').exists()).toBe(true)
  })
  it('keeps typing as a draft and applies a trimmed case-insensitive name substring on submit', async () => {
    const { screen, router } = await renderApp('/transactions?page=2')
    const input = screen.get('input[aria-label="Search transactions"]')
    await input.setValue('  rIcHaRd  ')
    expect(screen.get('tbody th').text()).toBe('Ella Phillips')
    expect(router.currentRoute.value.fullPath).toBe('/transactions?page=2')
    await screen.get('form[role="search"]').trigger('submit')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ search: 'rIcHaRd' })
    expect(screen.findAll('tbody th').map((row) => row.text())).toEqual([
      'Emma Richardson',
      'Emma Richardson',
    ])
    expect(screen.find('nav[aria-label="Transaction pages"]').exists()).toBe(false)
    expect((input.element as HTMLInputElement).value).toBe('rIcHaRd')
  })

  it('applies the draft through the accessible magnifying-glass button', async () => {
    const { screen, router } = await renderApp('/transactions')
    await screen.get('input').setValue('  SUN  ')
    await screen.get('button[aria-label="Submit search"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ search: 'SUN' })
    expect(screen.findAll('tbody th').map((row) => row.text())).toEqual(['Sun Park', 'Sun Park'])
  })

  it.each(['General', '75.50', 'not a sender'])(
    'matches names only and keeps search usable for no matches: %s',
    async (search) => {
      const { screen, router } = await renderApp('/transactions')
      await screen.get('input').setValue(search)
      await screen.get('form[role="search"]').trigger('submit')
      await flushPromises()
      expect(router.currentRoute.value.query).toEqual({ search })
      expect(screen.text()).toContain('No transactions found')
      expect(screen.findAll('tbody tr')).toHaveLength(0)
      expect(screen.find('nav[aria-label="Transaction pages"]').exists()).toBe(false)
      expect(
        screen.get('button[aria-label="Submit search"]').attributes('disabled'),
      ).toBeUndefined()
      expect(screen.text()).not.toContain('Clear filters')
      await screen.get('input').setValue('   ')
      await screen.get('form[role="search"]').trigger('submit')
      await flushPromises()
      expect(router.currentRoute.value.query).toEqual({})
      expect(screen.findAll('tbody tr')).toHaveLength(10)
      expect(screen.get('tbody th').text()).toBe('Emma Richardson')
    },
  )

  it.each([
    ['?search=%20Emma%20&page=99', 'Emma', ['Emma Richardson', 'Emma Richardson']],
    ['?search=&page=1', '', ['Emma Richardson', 'Savory Bites Bistro']],
    ['?search=Emma&search=Sun', '', ['Emma Richardson', 'Savory Bites Bistro']],
  ])('initializes and normalizes applied search from %s', async (query, applied, firstNames) => {
    const { screen, router } = await renderApp(`/transactions${query}`)
    expect((screen.get('input').element as HTMLInputElement).value).toBe(applied)
    expect(
      screen
        .findAll('tbody th')
        .slice(0, 2)
        .map((row) => row.text()),
    ).toEqual(firstNames)
    expect(router.currentRoute.value.query).toEqual(applied ? { search: applied } : {})
  })

  it('keeps multi-page matches navigable, retains applied search when paging, and restores history over drafts', async () => {
    const base = original[0]!
    demo.transactions.splice(
      0,
      demo.transactions.length,
      ...Array.from({ length: 12 }, (_, index) => ({
        ...base,
        name: `Matching sender ${index + 1}`,
        amount: index + 1,
      })),
      { ...base, name: 'Other sender' },
    )
    const { screen, router } = await renderApp('/transactions?page=2&other=keep')
    const input = screen.get('input')
    const names = () => screen.findAll('tbody th').map((row) => row.text())
    await input.setValue('matching')
    await screen.get('form[role="search"]').trigger('submit')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ search: 'matching', other: 'keep' })
    expect(names()).toEqual([
      'Matching sender 1',
      'Matching sender 2',
      'Matching sender 3',
      'Matching sender 4',
      'Matching sender 5',
      'Matching sender 6',
      'Matching sender 7',
      'Matching sender 8',
      'Matching sender 9',
      'Matching sender 10',
    ])
    await input.setValue('unsubmitted')
    await screen.get('button[aria-label="Next page"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({
      search: 'matching',
      page: '2',
      other: 'keep',
    })
    expect(names()).toEqual(['Matching sender 11', 'Matching sender 12'])
    expect(screen.get('button[aria-label="Next page"]').attributes('disabled')).toBeDefined()
    await input.setValue('another draft')
    router.back()
    await flushPromises()
    expect((input.element as HTMLInputElement).value).toBe('matching')
    expect(router.currentRoute.value.query.page).toBeUndefined()
    router.back()
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ page: '2', other: 'keep' })
    expect((input.element as HTMLInputElement).value).toBe('')
    expect(names()).toEqual(['Matching sender 11', 'Matching sender 12', 'Other sender'])
    router.forward()
    await flushPromises()
    expect((input.element as HTMLInputElement).value).toBe('matching')
    await screen.get('form[role="search"]').trigger('submit')
    await flushPromises()
    router.back()
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ page: '2', other: 'keep' })
  })

  it.each([10, 11])(
    'calculates page counts from %i matching records rather than all records',
    async (count) => {
      const base = original[0]!
      demo.transactions.splice(
        0,
        demo.transactions.length,
        ...Array.from({ length: count }, () => ({ ...base, name: 'Match' })),
        { ...base, name: 'Excluded' },
      )
      const { screen, router } = await renderApp('/transactions?search=Match&page=999')
      expect(screen.findAll('tbody tr')).toHaveLength(count === 10 ? 10 : 1)
      expect(router.currentRoute.value.query.page).toBe(count === 10 ? undefined : '2')
      expect(screen.find('nav[aria-label="Transaction pages"]').exists()).toBe(count === 11)
    },
  )

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
