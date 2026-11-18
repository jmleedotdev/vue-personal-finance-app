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
  it('retains explicit demo Budget identity rather than deriving it from array position', async () => {
    demo.budgets[0]!.id = 'budget-stable-identity'
    const { screen } = await renderApp()
    expect(screen.get('article h2').attributes('id')).toBe('budget-stable-identity-heading')
    await screen.get('button[aria-label="Manage Entertainment budget"]').trigger('click')
    await screen.get('[role="menuitem"]').trigger('click')
    await flushPromises()
    const dialog = screen.get('[role="dialog"]')
    await dialog.get('input').setValue('60')
    await dialog.get('form').trigger('submit')
    expect(screen.get('article h2').attributes('id')).toBe('budget-stable-identity-heading')
    expect(demo.budgets[0]!.maximum).toBe(50)
  })

  it('opens Edit from a named card menu, preloads saved values, and saves unchanged values', async () => {
    const { screen } = await renderApp()
    const trigger = screen.get('button[aria-label="Manage Entertainment budget"]')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    await screen.get('[role="menuitem"]').trigger('click')
    expect(screen.find('[role="menu"]').exists()).toBe(false)
    const dialog = screen.get('[role="dialog"]')
    expect(dialog.get('h2').text()).toBe('Edit Budget')
    expect(dialog.get('input').element.value).toBe('50.00')
    expect(dialog.findAll('[role="combobox"]').map((select) => select.text())).toEqual([
      'Entertainment',
      'Green',
    ])
    expect(dialog.get('button[type="submit"]').text()).toBe('Save Changes')
    await dialog.get('form').trigger('submit')
    expect(screen.find('[role="dialog"]').exists()).toBe(false)
    expect(screen.findAll('article h2').map((heading) => heading.text())).toEqual([
      'Entertainment',
      'Bills',
      'Dining Out',
      'Personal Care',
    ])
    expect(screen.get('article dd').text()).toBe('$50.00')
  })

  it('edits category, limit and theme in place, recalculates history, releases assignments and synchronizes Overview', async () => {
    const { screen, router } = await renderApp()
    const originalCard = screen.get('article').element
    const transactions = structuredClone(demo.transactions)
    await screen.get('button[aria-label="Manage Entertainment budget"]').trigger('click')
    await screen.get('[role="menuitem"]').trigger('click')
    await flushPromises()
    const dialog = screen.get('[role="dialog"]')
    const selectors = dialog.findAll('[role="combobox"]')
    await selectors[0]!.trigger('click')
    expect(dialog.findAll('[role="option"]').map((option) => option.text())).toEqual([
      'Education',
      'Entertainment',
      'General',
      'Groceries',
      'Lifestyle',
      'Shopping',
      'Transportation',
    ])
    await dialog
      .findAll('[role="option"]')
      .find((option) => option.text() === 'Education')!
      .trigger('click')
    await selectors[1]!.trigger('click')
    const options = dialog.findAll('[role="option"]')
    expect(options[0]!.attributes('aria-disabled')).toBe('false')
    expect(
      options.slice(1, 4).every((option) => option.attributes('aria-disabled') === 'true'),
    ).toBe(true)
    await options.find((option) => option.text() === 'Purple')!.trigger('click')
    await dialog.get('input').setValue('123.45')
    await dialog.get('form').trigger('submit')
    const card = screen.get('article')
    expect(card.element).toBe(originalCard)
    expect(screen.findAll('article h2').map((heading) => heading.text())).toEqual([
      'Education',
      'Bills',
      'Dining Out',
      'Personal Care',
    ])
    expect(card.findAll('dd').map((amount) => amount.text())).toEqual([
      '$123.45',
      '$50.00',
      '$73.45',
    ])
    expect(card.get('[role="progressbar"]').attributes('aria-valuetext')).toBe(
      '$50.00 spent of $123.45',
    )
    expect(card.findAll('li').map((row) => row.get('p').text())).toEqual([
      'Elevate Education',
      'Elevate Education',
    ])
    expect(card.get('a').attributes('href')).toBe('/transactions?category=Education')
    expect(screen.get('[aria-label="Budget categories"] li').text()).toBe(
      'Education$50.00of $123.45',
    )
    expect(screen.get('[role="img"]').attributes('aria-label')).toBe(
      'August 2024 budget spending: $373 spent of $1,048 limit.',
    )
    await screen.get('button[aria-label="Add New Budget"]').trigger('click')
    const add = screen.get('[role="dialog"]')
    await add.get('[role="combobox"]').trigger('click')
    expect(add.findAll('[role="option"]').map((option) => option.text())).toContain('Entertainment')
    expect(add.findAll('[role="option"]').map((option) => option.text())).not.toContain('Education')
    await add.get('[role="combobox"]').trigger('keydown', { key: 'Escape' })
    await add.findAll('[role="combobox"]')[1]!.trigger('click')
    expect(add.findAll('[role="option"]')[0]!.attributes('aria-disabled')).toBe('false')
    expect(
      add
        .findAll('[role="option"]')
        .find((option) => option.text() === 'PurpleAlready used')!
        .attributes('aria-disabled'),
    ).toBe('true')
    await add.get('button[aria-label="Close dialog"]').trigger('click')
    await router.push('/')
    await flushPromises()
    expect(screen.get('section[aria-labelledby="budgets-heading"]').text()).toContain('Education')
    expect(screen.get('[role="img"]').attributes('aria-label')).toBe(
      'August 2024 budget spending: $373 spent of $1,048 limit.',
    )
    await router.push('/budgets')
    await flushPromises()
    expect(screen.get('article h2').text()).toBe('Education')
    await screen.get('article a').trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/transactions'))
    expect(screen.findAll('tbody th').map((row) => row.text())).toEqual([
      'Elevate Education',
      'Elevate Education',
    ])
    expect(demo.transactions).toEqual(transactions)
    expect(demo.budgets).toEqual(originalBudgets)
  })

  it.each(['', '0', '-1', 'hello', 'Infinity', '1.001', '90071992547409.92'])(
    'retains the Edit draft for invalid amount %j and discards cancellation',
    async (amount) => {
      const { screen } = await renderApp()
      async function openEdit() {
        await screen.get('button[aria-label="Manage Entertainment budget"]').trigger('click')
        await screen.get('[role="menuitem"]').trigger('click')
        await flushPromises()
        return screen.get('[role="dialog"]')
      }
      const dialog = await openEdit()
      await dialog.get('input').setValue(amount)
      await dialog.get('form').trigger('submit')
      expect(dialog.get('input').element.value).toBe(amount)
      expect(dialog.get('input').attributes('aria-invalid')).toBe('true')
      expect(screen.get('article dd').text()).toBe('$50.00')
      await dialog.get('button[aria-label="Close dialog"]').trigger('click')
      const reopened = await openEdit()
      expect(reopened.get('input').element.value).toBe('50.00')
      expect(reopened.get('input').attributes('aria-invalid')).toBeUndefined()
      await reopened.get('input').setValue('60.25')
      await reopened.get('form').trigger('submit')
      expect(screen.get('article dd').text()).toBe('$60.25')
    },
  )

  it('adds a fresh budget once, appends its card, and synchronizes Overview through navigation', async () => {
    const { screen, router } = await renderApp()
    await screen.get('button[aria-label="Add New Budget"]').trigger('click')
    const dialog = screen.get('[role="dialog"]')
    expect(dialog.get('[role="combobox"]').text()).toContain('Education')
    expect(dialog.findAll('[role="combobox"]')[1]!.text()).toContain('Red')
    expect(dialog.get('input').element.value).toBe('')
    await dialog.get('input').setValue('123.45')
    const form = dialog.get('form').element
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flushPromises()
    expect(screen.find('[role="dialog"]').exists()).toBe(false)
    expect(screen.findAll('article h2').map((heading) => heading.text())).toEqual([
      'Entertainment',
      'Bills',
      'Dining Out',
      'Personal Care',
      'Education',
    ])
    expect(
      screen
        .findAll('article')[4]!
        .findAll('dd')
        .map((amount) => amount.text()),
    ).toEqual(['$123.45', '$50.00', '$73.45'])
    expect(screen.get('[aria-label="Budget categories"]').findAll('li')[4]!.text()).toBe(
      'Education$50.00of $123.45',
    )
    expect(screen.get('[role="img"]').attributes('aria-label')).toBe(
      'August 2024 budget spending: $388 spent of $1,098 limit.',
    )
    await router.push('/')
    await flushPromises()
    expect(screen.get('section[aria-labelledby="budgets-heading"]').text()).toContain('Education')
    expect(
      screen
        .get('section[aria-labelledby="budgets-heading"] [role="img"]')
        .attributes('aria-label'),
    ).toBe('August 2024 budget spending: $388 spent of $1,098 limit.')
    await router.push('/budgets')
    await flushPromises()
    expect(screen.findAll('article')).toHaveLength(5)
    expect(demo.budgets).toEqual(originalBudgets)
    const fresh = await renderApp()
    expect(fresh.screen.findAll('article')).toHaveLength(4)
  })

  it.each([
    '',
    '0',
    '-1',
    'hello',
    'NaN',
    'Infinity',
    '1.001',
    '90071992547409.92',
    '90071992547409.91',
    '90071992547409.90',
    '9999999999999999999999999999999999999999',
    '1e2',
  ])('retains invalid Maximum Spend %j without saving and accepts correction', async (amount) => {
    const { screen } = await renderApp()
    await screen.get('button[aria-label="Add New Budget"]').trigger('click')
    const dialog = screen.get('[role="dialog"]')
    await dialog.get('input').setValue(amount)
    await dialog.get('form').trigger('submit')
    expect(screen.find('[role="dialog"]').exists()).toBe(true)
    expect(dialog.get('input').element.value).toBe(amount)
    expect(dialog.get('input').attributes('aria-invalid')).toBe('true')
    const errorId = dialog.get('input').attributes('aria-describedby')
    expect(dialog.get(`[id="${errorId}"]`).text()).toBe(
      'Enter an amount above $0 with up to 2 decimal places.',
    )
    expect(screen.findAll('article')).toHaveLength(4)
    await dialog.get('input').setValue('0.29')
    await dialog.get('form').trigger('submit')
    expect(screen.find('[role="dialog"]').exists()).toBe(false)
    expect(screen.findAll('article')[4]!.get('dd').text()).toBe('$0.29')
  })

  it('offers only unused categories and visible disabled budget themes, independently of pots', async () => {
    const { screen } = await renderApp()
    await screen.get('button[aria-label="Add New Budget"]').trigger('click')
    const dialog = screen.get('[role="dialog"]')
    const selectors = dialog.findAll('[role="combobox"]')
    await selectors[0]!.trigger('click')
    expect(dialog.findAll('[role="option"]').map((option) => option.text())).toEqual([
      'Education',
      'General',
      'Groceries',
      'Lifestyle',
      'Shopping',
      'Transportation',
    ])
    await selectors[0]!.trigger('keydown', { key: 'Escape' })
    await selectors[1]!.trigger('click')
    const options = dialog.findAll('[role="option"]')
    expect(options.slice(0, 4).map((option) => option.text())).toEqual([
      'GreenAlready used',
      'YellowAlready used',
      'CyanAlready used',
      'NavyAlready used',
    ])
    expect(
      options.slice(0, 4).every((option) => option.attributes('aria-disabled') === 'true'),
    ).toBe(true)
    await options[0]!.trigger('click')
    expect(selectors[1]!.text()).toContain('Red')
    expect(selectors[1]!.attributes('aria-expanded')).toBe('true')
    await selectors[1]!.trigger('keydown', { key: 'Home' })
    await selectors[1]!.trigger('keydown', { key: 'ArrowUp' })
    await selectors[1]!.trigger('keydown', { key: 'g' })
    await selectors[1]!.trigger('keydown', { key: 'Enter' })
    expect(selectors[1]!.text()).toContain('Grey')
    await selectors[1]!.trigger('click')
    const purple = dialog.findAll('[role="option"]').find((option) => option.text() === 'Purple')!
    expect(purple.attributes('aria-disabled')).toBe('false')
    await purple.trigger('click')
    await dialog.get('input').setValue('20')
    await dialog.get('form').trigger('submit')
    await screen.get('button[aria-label="Add New Budget"]').trigger('click')
    expect(screen.get('[role="dialog"] [role="combobox"]').text()).toContain('General')
    expect(screen.findAll('[role="dialog"] [role="combobox"]')[1]!.text()).toContain('Red')
  })

  it.each(['categories', 'themes'])(
    'disables Add without an explanation when %s alone are exhausted',
    async (resource) => {
      if (resource === 'categories') {
        demo.transactions.splice(
          0,
          demo.transactions.length,
          ...originalTransactions.filter((transaction) => transaction.category === 'Bills'),
        )
        demo.budgets.splice(0, demo.budgets.length, {
          id: 'budget-bills',
          category: 'Bills',
          maximum: 10,
          theme: '#277C78',
        })
      } else {
        const colors = [
          '#277C78',
          '#F2CDAC',
          '#82C9D7',
          '#626070',
          '#C94736',
          '#826CB0',
          '#597C7C',
          '#93674F',
          '#934F6F',
          '#3F82B2',
          '#97A0AC',
          '#7F9161',
          '#AF81BA',
          '#CAB361',
          '#BE6C49',
        ]
        demo.budgets.splice(
          0,
          demo.budgets.length,
          ...colors.map((theme, index) => ({
            id: `budget-${index}`,
            category: `Category ${index}`,
            maximum: 10,
            theme,
          })),
        )
        demo.transactions.splice(
          0,
          demo.transactions.length,
          ...demo.budgets.map((budget) => ({
            ...originalTransactions[0]!,
            category: budget.category,
          })),
          { ...originalTransactions[0]!, category: 'Unused' },
        )
      }
      const { screen } = await renderApp()
      const add = screen.get('button[aria-label="Add New Budget"]')
      expect(add.attributes('disabled')).toBeDefined()
      expect(add.attributes('aria-describedby')).toBeUndefined()
      expect(screen.text()).not.toContain('All transaction categories already have a budget.')
      expect(screen.text()).not.toContain('All budget themes are already used.')
      expect(screen.find('[role="dialog"]').exists()).toBe(false)
    },
  )

  it('recovers from zero budgets and uses a pot color without reserving it', async () => {
    demo.budgets.splice(0)
    const { screen, router } = await renderApp()
    await screen.get('button[aria-label="Add New Budget"]').trigger('click')
    const dialog = screen.get('[role="dialog"]')
    expect(dialog.get('[role="combobox"]').text()).toContain('Bills')
    expect(dialog.findAll('[role="combobox"]')[1]!.text()).toContain('Green')
    await dialog.get('input').setValue('200.01')
    await dialog.get('form').trigger('submit')
    expect(screen.text()).not.toContain('No budgets yet')
    expect(
      screen
        .get('article')
        .findAll('dd')
        .map((dd) => dd.text()),
    ).toEqual(['$200.01', '$150.00', '$50.01'])
    expect(screen.get('[role="img"]').attributes('aria-label')).toBe(
      'August 2024 budget spending: $150 spent of $200 limit.',
    )
    expect(screen.get('[role="img"]').findAll('path').length).toBeGreaterThan(0)
    await router.push('/')
    await flushPromises()
    expect(screen.get('section[aria-labelledby="budgets-heading"]').text()).toContain(
      'Spent $150.00 of $200.01 limit.',
    )
  })

  it.each([
    ['0.01', '$0.01'],
    ['90071992547409.89', '$90,071,992,547,409.89'],
    ['0005.20', '$5.20'],
    ['.50', '$0.50'],
    ['1.', '$1.00'],
    [' 2.50 ', '$2.50'],
  ])('saves valid decimal USD input %j as %s without rounding', async (input, expected) => {
    const { screen } = await renderApp()
    await screen.get('button[aria-label="Add New Budget"]').trigger('click')
    const dialog = screen.get('[role="dialog"]')
    await dialog.get('input').setValue(input)
    await dialog.get('form').trigger('submit')
    expect(screen.find('[role="dialog"]').exists()).toBe(false)
    expect(screen.findAll('article')[4]!.get('dd').text()).toBe(expected)
  })

  it('shows fewer than three outgoing rows without padding and an empty category without history', async () => {
    demo.budgets.splice(
      0,
      demo.budgets.length,
      { id: 'budget-travel', category: 'Travel', maximum: 20, theme: '#277C78' },
      { id: 'budget-fitness', category: 'Fitness', maximum: 30, theme: '#82C9D7' },
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
        id: 'budget-bills',
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
      id: 'budget-dining',
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
      id: 'budget-income',
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
    expect(screen.findAll('article button[aria-haspopup="menu"]')).toHaveLength(4)
    expect(screen.get('nav button[aria-label="Pots"]').attributes('disabled')).toBeDefined()
    await screen.get('nav a[aria-label="Overview"]').trigger('click')
    await flushPromises()
    await screen.get('nav a[aria-label="Budgets"]').trigger('click')
    await flushPromises()
    expect(screen.get('h1').text()).toBe('Budgets')
  })
})
