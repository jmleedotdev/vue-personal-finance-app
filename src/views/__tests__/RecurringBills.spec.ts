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
  const screen = mount(App, { attachTo: document.body, global: { plugins: [router] } })
  screens.push(screen)
  await flushPromises()
  return { screen, router }
}

async function chooseSort(screen: ReturnType<typeof mount>, value: string) {
  await screen.get('[aria-label="Sort bills"]').trigger('click')
  await screen
    .findAll('[role="option"]')
    .find((option) => option.text() === value)!
    .trigger('click')
  await flushPromises()
}

describe('Recurring Bills', () => {
  it('keeps typing as a draft and submits a trimmed partial payee search without changing reporting summaries', async () => {
    const { screen, router } = await renderApp('/recurring-bills?sort=Highest&page=4&other=keep')
    const input = screen.get('input[aria-label="Search bills"]')
    await input.setValue('  eLeC  ')
    expect(screen.findAll('tbody tr')).toHaveLength(8)
    expect(router.currentRoute.value.query).toEqual({ sort: 'Highest', page: '4', other: 'keep' })
    await screen.get('form[role="search"]').trigger('submit')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({
      sort: 'Highest',
      search: 'eLeC',
      other: 'keep',
    })
    expect((input.element as HTMLInputElement).value).toBe('eLeC')
    expect(screen.findAll('tbody th').map((row) => row.text())).toEqual([
      'Spark Electric Solutions',
    ])
    expect(screen.get('section[aria-labelledby="total-bills-heading"] dd').text()).toBe('$384.98')
    expect(
      screen.findAll('section[aria-labelledby="bill-summary-heading"] dd').map((dd) => dd.text()),
    ).toEqual(['4 ($190.00)', '4 ($194.98)', '2 ($59.98)'])
  })

  it('restores applied search over stale drafts on Back/Forward and keeps sorting independent of the draft', async () => {
    const { screen, router } = await renderApp(
      '/recurring-bills?search=Energy&sort=Highest&other=keep',
    )
    const input = screen.get('input')
    const names = () => screen.findAll('tbody th').map((row) => row.text())
    expect((input.element as HTMLInputElement).value).toBe('Energy')
    expect(names()).toEqual(['EcoFuel Energy'])
    await input.setValue('Nimbus')
    await chooseSort(screen, 'Lowest')
    expect(router.currentRoute.value.query).toEqual({
      search: 'Energy',
      sort: 'Lowest',
      other: 'keep',
    })
    expect(names()).toEqual(['EcoFuel Energy'])
    await input.setValue('  Data  ')
    await screen.get('button[aria-label="Submit search"]').trigger('click')
    await flushPromises()
    expect(names()).toEqual(['Nimbus Data Storage'])
    expect(router.currentRoute.value.query.search).toBe('Data')
    // Reapplying the same search is not a new history stop.
    await screen.get('form[role="search"]').trigger('submit')
    await flushPromises()
    await input.setValue('stale')
    router.back()
    await flushPromises()
    expect((input.element as HTMLInputElement).value).toBe('Energy')
    expect(names()).toEqual(['EcoFuel Energy'])
    expect(screen.get('[aria-label="Sort bills"]').text()).toContain('Lowest')
    await input.setValue('another stale draft')
    router.forward()
    await flushPromises()
    expect((input.element as HTMLInputElement).value).toBe('Data')
    expect(names()).toEqual(['Nimbus Data Storage'])
    const reloaded = await renderApp(router.currentRoute.value.fullPath)
    expect(reloaded.screen.get('input').element.value).toBe('Data')
    expect(reloaded.screen.findAll('tbody th').map((row) => row.text())).toEqual([
      'Nimbus Data Storage',
    ])
  })

  it.each(['Entertainment', '100.00', '2024-08-02', 'Monthly', 'Paid', 'no such payee'])(
    'searches payee names only and recovers from no matches with an empty submission: %s',
    async (search) => {
      const { screen, router } = await renderApp('/recurring-bills?sort=Highest')
      await screen.get('input').setValue(search)
      await screen.get('button[aria-label="Submit search"]').trigger('click')
      await flushPromises()
      expect(screen.findAll('tbody tr')).toHaveLength(0)
      expect(screen.get('section[aria-label="Monthly recurring bills"] p').text()).toBe(
        'No bills found',
      )
      expect(screen.get('input').attributes('disabled')).toBeUndefined()
      expect(
        screen.get('button[aria-label="Submit search"]').attributes('disabled'),
      ).toBeUndefined()
      expect(screen.get('[aria-label="Sort bills"]').text()).toContain('Highest')
      expect(screen.text()).not.toContain('Clear filters')
      expect(screen.get('section[aria-labelledby="total-bills-heading"] dd').text()).toBe('$384.98')
      expect(
        screen.findAll('section[aria-labelledby="bill-summary-heading"] dd').map((dd) => dd.text()),
      ).toEqual(['4 ($190.00)', '4 ($194.98)', '2 ($59.98)'])
      await screen.get('input').setValue('   ')
      await screen.get('form[role="search"]').trigger('submit')
      await flushPromises()
      expect(router.currentRoute.value.query).toEqual({ sort: 'Highest' })
      expect(screen.get('input').element.value).toBe('')
      expect(screen.findAll('tbody tr')).toHaveLength(8)
      expect(screen.get('tbody th').text()).toBe('Spark Electric Solutions')
    },
  )

  it.each([
    ['search=%20dAtA%20', 'dAtA', ['Nimbus Data Storage']],
    ['search=', '', null],
    ['search', '', null],
    ['search=%20%20', '', null],
    ['search=Energy&search=Data', '', null],
    ['search&search=Energy', '', null],
  ])(
    'normalizes applied search on direct entry without an extra history stop: %s',
    async (query, applied, expected) => {
      const { screen, router } = await renderApp(
        `/recurring-bills?${query}&sort=Lowest&other=one&other=two&page=3`,
      )
      expect(router.currentRoute.value.query).toEqual({
        ...(applied ? { search: applied } : {}),
        sort: 'Lowest',
        other: ['one', 'two'],
        page: '3',
      })
      expect(screen.get('input').element.value).toBe(applied)
      expect(screen.findAll('tbody th').map((row) => row.text())).toEqual(
        expected ?? [
          'Nimbus Data Storage',
          'Pixel Playground',
          'Serenity Spa & Wellness',
          'EcoFuel Energy',
          'ByteWise',
          'Elevate Education',
          'Spark Electric Solutions',
          'Aqua Flow Utilities',
        ],
      )
      await screen.get('input').setValue('Byte')
      await screen.get('form[role="search"]').trigger('submit')
      await flushPromises()
      router.back()
      await flushPromises()
      expect(screen.get('input').element.value).toBe(applied)
      expect(router.currentRoute.value.query.page).toBe('3')
      expect(router.currentRoute.value.query.other).toEqual(['one', 'two'])
    },
  )

  it('pushes sort changes, drops page constraints, restores history and reloads without leaking into Transactions', async () => {
    const { screen, router } = await renderApp('/recurring-bills?search=e&other=keep&page=4')
    const names = () => screen.findAll('tbody th').map((row) => row.text())
    await chooseSort(screen, 'Highest')
    expect(router.currentRoute.value.query).toEqual({
      search: 'e',
      other: 'keep',
      sort: 'Highest',
    })
    expect(names()).toEqual([
      'Spark Electric Solutions',
      'Aqua Flow Utilities',
      'Elevate Education',
      'ByteWise',
      'EcoFuel Energy',
      'Serenity Spa & Wellness',
      'Pixel Playground',
      'Nimbus Data Storage',
    ])
    await chooseSort(screen, 'Oldest')
    expect(router.currentRoute.value.query).toEqual({ search: 'e', other: 'keep' })
    // Selecting the already applied option must not create another history entry.
    await chooseSort(screen, 'Oldest')
    router.back()
    await flushPromises()
    expect(screen.get('[aria-label="Sort bills"]').text()).toContain('Highest')
    expect(names().slice(0, 2)).toEqual(['Spark Electric Solutions', 'Aqua Flow Utilities'])
    router.back()
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ search: 'e', other: 'keep', page: '4' })
    expect(screen.get('[aria-label="Sort bills"]').text()).toContain('Oldest')
    router.forward()
    await flushPromises()
    expect(screen.get('[aria-label="Sort bills"]').text()).toContain('Highest')
    const reloaded = await renderApp(router.currentRoute.value.fullPath)
    expect(reloaded.screen.get('[aria-label="Sort bills"]').text()).toContain('Highest')
    expect(reloaded.screen.findAll('tbody th').map((row) => row.text())).toEqual(names())
    await router.push('/transactions')
    await flushPromises()
    expect(screen.get('[aria-label="Sort transactions"]').text()).toContain('Latest')
    expect(screen.get('input').element.value).toBe('')
    await router.push('/recurring-bills')
    await flushPromises()
    expect(screen.get('[aria-label="Sort bills"]').text()).toContain('Oldest')
  })

  it('offers the shared menu order and retains keyboard focus, selection and dismissal behavior', async () => {
    const { screen, router } = await renderApp()
    const control = screen.get('[aria-label="Sort bills"]')
    ;(control.element as HTMLButtonElement).focus()
    await control.trigger('keydown', { key: 'Enter' })
    expect(screen.findAll('[role="option"]').map((option) => option.text())).toEqual([
      'Latest',
      'Oldest',
      'A to Z',
      'Z to A',
      'Highest',
      'Lowest',
    ])
    expect(screen.get('[role="option"][aria-selected="true"]').text()).toBe('Oldest')
    await control.trigger('keydown', { key: 'End' })
    await control.trigger('keydown', { key: 'Enter' })
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ sort: 'Lowest' })
    expect(document.activeElement).toBe(control.element)
    expect(screen.find('[role="listbox"]').exists()).toBe(false)
    await control.trigger('keydown', { key: 'Enter' })
    expect(screen.get('[role="option"][aria-selected="true"]').text()).toBe('Lowest')
    await control.trigger('keydown', { key: 'Home' })
    await control.trigger('keydown', { key: 'Escape' })
    expect(router.currentRoute.value.query).toEqual({ sort: 'Lowest' })
    expect(document.activeElement).toBe(control.element)
    await control.trigger('click')
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await flushPromises()
    expect(screen.find('[role="listbox"]').exists()).toBe(false)
    expect(router.currentRoute.value.query).toEqual({ sort: 'Lowest' })
  })

  it.each([
    'sort=Oldest',
    'sort=nope',
    'sort=',
    'sort',
    'sort=Highest&sort=Lowest',
    'sort=highest',
    'sort=%20Latest%20',
  ])(
    'normalizes malformed or redundant sort state without losing unrelated query parameters: %s',
    async (query) => {
      const { screen, router } = await renderApp(
        `/recurring-bills?${query}&search=e&other=one&other=two&page=3`,
      )
      expect(router.currentRoute.value.query).toEqual({
        search: 'e',
        other: ['one', 'two'],
        page: '3',
      })
      expect(screen.get('[aria-label="Sort bills"]').text()).toContain('Oldest')
      expect(screen.get('tbody th').text()).toBe('Spark Electric Solutions')
      // Normalization replaces the entry rather than adding a history stop.
      await chooseSort(screen, 'Latest')
      router.back()
      await flushPromises()
      expect(router.currentRoute.value.query).toEqual({
        search: 'e',
        other: ['one', 'two'],
        page: '3',
      })
    },
  )

  it.each([
    ['Latest', ['Alpha', 'Delta', 'Beta', 'Zulu']],
    ['Oldest', ['Beta', 'Zulu', 'Delta', 'Alpha']],
    ['A to Z', ['Alpha', 'Beta', 'Delta', 'Zulu']],
    ['Z to A', ['Zulu', 'Delta', 'Beta', 'Alpha']],
    ['Highest', ['Alpha', 'Delta', 'Beta', 'Zulu']],
    ['Lowest', ['Beta', 'Zulu', 'Delta', 'Alpha']],
  ])(
    'sorts by %s using due dates, positive amounts and stable supplied-order ties',
    async (sort, expected) => {
      demo.transactions.splice(
        0,
        demo.transactions.length,
        ...[
          { name: 'Beta', amount: -10, date: '2024-08-02T01:00:00Z' },
          { name: 'Alpha', amount: -100, date: '2024-07-28T23:00:00Z' },
          { name: 'Zulu', amount: -10, date: '2024-06-02T12:00:00Z' },
          { name: 'Delta', amount: -50, date: '2024-08-15T12:00:00Z' },
        ].map((entry) => ({ ...original[0]!, recurring: true, ...entry })),
      )
      const { screen } = await renderApp(`/recurring-bills?sort=${encodeURIComponent(sort)}`)
      expect(screen.findAll('tbody th').map((row) => row.text())).toEqual(expected)
      expect(screen.get('[aria-label="Sort bills"]').text()).toContain(sort)
      expect(screen.get('section[aria-labelledby="total-bills-heading"] dd').text()).toBe('$170.00')
      expect(
        screen.findAll('section[aria-labelledby="bill-summary-heading"] dd').map((dd) => dd.text()),
      ).toEqual(['2 ($60.00)', '2 ($110.00)', '1 ($10.00)'])
      expect(
        screen
          .findAll('tbody tr')
          .map(
            (row) => `${row.get('th').text()}|${row.get('[role="img"]').attributes('aria-label')}`,
          ),
      ).toEqual(
        expected.map(
          (name) =>
            ({
              Alpha: 'Alpha|Upcoming',
              Beta: 'Beta|Paid',
              Zulu: 'Zulu|Due Soon',
              Delta: 'Delta|Paid',
            })[name],
        ),
      )
    },
  )

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
    expect(screen.get('input').attributes('placeholder')).toBe('Search bills')
    expect(screen.get('[aria-label="Sort bills"]').text()).toContain('Oldest')
  })
})
