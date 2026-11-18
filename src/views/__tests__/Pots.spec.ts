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

it('creates an appended zero-savings pot, synchronizes Overview and resets a fresh app', async () => {
  const { screen, router } = await renderApp('/pots')
  await screen.get('header button').trigger('click')
  const dialog = screen.get('[role="dialog"]')
  expect(dialog.attributes('aria-labelledby')).toBeTruthy()
  expect(dialog.findAll('input')).toHaveLength(2)
  await dialog.get('input').setValue('  Rainy Days  ')
  await dialog.get('input[inputmode="decimal"]').setValue('1234.56')
  await dialog.get('form').trigger('submit')
  expect(screen.find('[role="dialog"]').exists()).toBe(false)
  expect(screen.findAll('article h2').map((heading) => heading.text())).toEqual([
    'Savings',
    'Concert Ticket',
    'Gift',
    'New Laptop',
    'Holiday',
    'Rainy Days',
  ])
  const last = screen.findAll('article')[5]!
  const headingId = last.get('h2').attributes('id')
  expect(last.get('dd').text()).toBe('$0.00')
  expect(last.text()).toContain('Target of $1,234.56')
  await router.push('/')
  await flushPromises()
  const summary = screen.get('section[aria-labelledby="pots-heading"]')
  expect(summary.text()).toContain('Rainy Days$0')
  expect(summary.text()).toContain('Total Saved$920')
  expect(screen.get('[aria-label="Balance summaries"]').text()).toBe(
    'Current Balance$4,836.00Income$3,814.25Expenses$1,700.50',
  )
  await router.push('/pots')
  await flushPromises()
  expect(screen.findAll('article h2')[5]!.attributes('id')).toBe(headingId)
  const fresh = await renderApp('/pots')
  expect(fresh.screen.findAll('article')).toHaveLength(5)
})

it('edits saved metadata without moving money or identity and synchronizes Overview', async () => {
  const { screen, router } = await renderApp('/pots')
  const headingId = screen.get('article h2').attributes('id')
  await screen.get('[aria-label="Manage Savings pot"]').trigger('click')
  expect(screen.get('[role="menuitem"]').text()).toBe('Edit Pot')
  await screen.get('[role="menuitem"]').trigger('click')
  await flushPromises()
  expect(screen.find('[role="menu"]').exists()).toBe(false)
  const dialog = screen.get('[role="dialog"]')
  expect(dialog.get<HTMLInputElement>('input').element.value).toBe('Savings')
  expect(dialog.get<HTMLInputElement>('input[inputmode="decimal"]').element.value).toBe('2000.00')
  expect(dialog.get('[role="combobox"]').text()).toBe('Green')
  await dialog.get('input').setValue('  Future Plans  ')
  await dialog.get('input[inputmode="decimal"]').setValue('100')
  await dialog.get('[role="combobox"]').trigger('click')
  await dialog
    .findAll('[role="option"]')
    .find((option) => option.text() === 'Red')!
    .trigger('click')
  await dialog.get('form').trigger('submit')
  expect(screen.find('[role="dialog"]').exists()).toBe(false)
  expect(screen.findAll('article h2').map((heading) => heading.text())).toEqual([
    'Future Plans',
    'Concert Ticket',
    'Gift',
    'New Laptop',
    'Holiday',
  ])
  expect(screen.get('article h2').attributes('id')).toBe(headingId)
  expect(screen.get('article dd').text()).toBe('$159.00')
  expect(screen.get('article').text()).toContain('159%')
  expect(screen.get('article [role="progressbar"]').attributes('aria-valuenow')).toBe('100')
  await screen.get('[aria-label="Manage Future Plans pot"]').trigger('click')
  await screen.get('[role="menuitem"]').trigger('click')
  await flushPromises()
  expect(screen.get('[role="combobox"]').text()).toBe('Red')
  await screen.get('form').trigger('submit')
  expect(screen.find('[role="dialog"]').exists()).toBe(false)
  await router.push('/')
  await flushPromises()
  expect(screen.get('section[aria-labelledby="pots-heading"]').text()).toContain('Future Plans$159')
  expect(screen.get('section[aria-labelledby="pots-heading"]').text()).toContain('Total Saved$920')
  expect(screen.get('[aria-label="Balance summaries"]').text()).toBe(
    'Current Balance$4,836.00Income$3,814.25Expenses$1,700.50',
  )
  await router.push('/pots')
  await flushPromises()
  expect(screen.get('article h2').attributes('id')).toBe(headingId)
  expect(screen.get('article').text()).toContain('Target of $100.00')
})

it('validates edits against other pots and retains unchanged names and themes', async () => {
  const { screen } = await renderApp('/pots')
  await screen.get('[aria-label="Manage Concert Ticket pot"]').trigger('click')
  await screen.get('[role="menuitem"]').trigger('click')
  await flushPromises()
  const dialog = screen.get('[role="dialog"]')
  const name = dialog.get('input')
  const target = dialog.get('input[inputmode="decimal"]')
  await dialog.get('[role="combobox"]').trigger('click')
  const options = dialog.findAll('[role="option"]')
  expect(options.find((option) => option.text() === 'Navy')!.attributes('aria-disabled')).toBe(
    'false',
  )
  const green = options.find((option) => option.text() === 'GreenAlready used')!
  expect(green.attributes('aria-disabled')).toBe('true')
  await green.trigger('click')
  expect(dialog.get('[role="combobox"]').text()).toBe('Navy')
  await dialog.get('[role="combobox"]').trigger('keydown', { key: 'Escape' })
  for (const value of ['', '  ', '  sAvInGs  ', 'x'.repeat(31)]) {
    await name.setValue(value)
    await dialog.get('form').trigger('submit')
    expect(name.attributes('aria-invalid')).toBe('true')
    expect(dialog.text()).toMatch(/Enter a name|already exists/)
    expect(screen.findAll('article h2')[1]!.text()).toBe('Concert Ticket')
  }
  await name.setValue('  cOnCeRt TiCkEt  ')
  for (const value of [
    '',
    '0',
    '-1',
    'abc',
    'NaN',
    'Infinity',
    '1e309',
    '1.001',
    '90071992547409.92',
    '90071992547409.91',
  ]) {
    await target.setValue(value)
    await dialog.get('form').trigger('submit')
    expect(target.attributes('aria-invalid')).toBe('true')
    expect(dialog.text()).toContain('Enter an amount above $0 with up to 2 decimal places.')
    expect((target.element as HTMLInputElement).value).toBe(value)
    expect(screen.findAll('article')[1]!.text()).toContain('Target of $150.00')
  }
  await target.setValue('110.01')
  await dialog.get('form').trigger('submit')
  expect(screen.find('[role="dialog"]').exists()).toBe(false)
  expect(screen.findAll('article h2')[1]!.text()).toBe('cOnCeRt TiCkEt')
  expect(screen.findAll('article')[1]!.text()).toContain('Target of $110.01')
})

it('discards Edit drafts and reloads saved metadata after every dismissal path', async () => {
  const { screen, router } = await renderApp('/transactions')
  const transactions = screen.get('main').text()
  await router.push('/pots')
  await flushPromises()
  for (const dismissal of ['close', 'escape', 'backdrop']) {
    await screen.get('[aria-label="Manage Savings pot"]').trigger('click')
    await screen.get('[role="menuitem"]').trigger('click')
    await flushPromises()
    const dialog = screen.get('[role="dialog"]')
    expect(dialog.get<HTMLInputElement>('input').element.value).toBe('Savings')
    expect(dialog.get<HTMLInputElement>('input[inputmode="decimal"]').element.value).toBe('2000.00')
    expect(dialog.get('[role="combobox"]').text()).toBe('Green')
    await dialog.get('input').setValue('Canceled')
    await dialog.get('input[inputmode="decimal"]').setValue('5')
    await dialog.get('[role="combobox"]').trigger('click')
    await dialog
      .findAll('[role="option"]')
      .find((option) => option.text() === 'Red')!
      .trigger('click')
    await dialog.get('h2').trigger('click')
    expect(screen.find('[role="dialog"]').exists()).toBe(true)
    if (dismissal === 'close') await dialog.get('[aria-label="Close dialog"]').trigger('click')
    else if (dismissal === 'escape')
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    else dialog.element.parentElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()
    expect(screen.find('[role="dialog"]').exists()).toBe(false)
    expect(screen.get('article').text()).toContain('Target of $2,000.00')
    expect(screen.get('article dd').text()).toBe('$159.00')
  }
  // A confirmed metadata edit must not create or change transaction records either.
  await screen.get('[aria-label="Manage Savings pot"]').trigger('click')
  await screen.get('[role="menuitem"]').trigger('click')
  await flushPromises()
  await screen.get('input[inputmode="decimal"]').setValue('100')
  await screen.get('form').trigger('submit')
  await router.push('/transactions')
  await flushPromises()
  expect(screen.get('main').text()).toBe(transactions)
})

it('rejects invalid names and targets inline without mutation, then allows correction', async () => {
  const { screen } = await renderApp('/pots')
  await screen.get('header button').trigger('click')
  const dialog = screen.get('[role="dialog"]')
  const name = dialog.get('input')
  const target = dialog.get('input[inputmode="decimal"]')
  await target.setValue('100')
  for (const value of ['', '   ', '  sAvInGs  ', 'x'.repeat(31)]) {
    await name.setValue(value)
    await dialog.get('form').trigger('submit')
    expect(name.attributes('aria-invalid')).toBe('true')
    expect(dialog.text()).toMatch(/Enter a name|already exists/)
    expect(screen.findAll('article')).toHaveLength(5)
  }
  await name.setValue('x'.repeat(30))
  for (const value of [
    '',
    '0',
    '-1',
    'abc',
    'NaN',
    'Infinity',
    '1e309',
    '1.001',
    '90071992547409.92',
    '90071992547409.91',
  ]) {
    await target.setValue(value)
    await dialog.get('form').trigger('submit')
    expect(target.attributes('aria-invalid')).toBe('true')
    expect(dialog.text()).toContain('Enter an amount above $0 with up to 2 decimal places.')
    expect(screen.find('[role="dialog"]').exists()).toBe(true)
    expect(screen.findAll('article')).toHaveLength(5)
  }
  await target.setValue('0.01')
  await dialog.get('form').trigger('submit')
  expect(screen.find('[role="dialog"]').exists()).toBe(false)
  expect(screen.findAll('article h2')[5]!.text()).toBe('x'.repeat(30))
  expect(screen.findAll('article')[5]!.text()).toContain('Target of $0.01')
  await screen.get('header button').trigger('click')
  await screen.get('[role="dialog"] input').setValue('Z')
  await screen.get('input[inputmode="decimal"]').setValue('12.34')
  await screen.get('form').trigger('submit')
  expect(screen.findAll('article h2')[6]!.text()).toBe('Z')
})

it('keeps pot colors independent of budgets and disables creation after exhausting the palette', async () => {
  const { screen, router } = await renderApp('/pots')
  const colors = [
    'Red',
    'Turquoise',
    'Brown',
    'Magenta',
    'Blue',
    'Grey',
    'Army',
    'Pink',
    'Gold',
    'Orange',
  ]
  for (const color of colors) {
    await screen.get('header button').trigger('click')
    const dialog = screen.get('[role="dialog"]')
    const theme = dialog.get('[role="combobox"]')
    expect(theme.text()).toBe(color)
    await theme.trigger('click')
    const options = dialog.findAll('[role="option"]')
    expect(options).toHaveLength(15)
    expect(
      options.find((option) => option.text() === 'GreenAlready used')!.attributes('aria-disabled'),
    ).toBe('true')
    expect(options.find((option) => option.text() === color)!.attributes('aria-disabled')).toBe(
      'false',
    )
    await theme.trigger('keydown', { key: 'Escape' })
    await dialog.get('input').setValue(`Goal ${color}`)
    await dialog.get('input[inputmode="decimal"]').setValue('20.01')
    await dialog.get('form').trigger('submit')
    expect(screen.find('[role="dialog"]').exists()).toBe(false)
  }
  const add = screen.get('header button')
  expect(add.attributes('disabled')).toBeDefined()
  expect(add.attributes('aria-label')).toBe('Add New Pot')
  expect(add.attributes('aria-describedby')).toBeUndefined()
  expect(screen.findAll('article')).toHaveLength(15)
  await router.push('/budgets')
  await flushPromises()
  await screen.get('header button').trigger('click')
  const selects = screen.findAll('[role="dialog"] [role="combobox"]')
  await selects[1]!.trigger('click')
  expect(
    screen
      .findAll('[role="option"]')
      .find((option) => option.text() === 'Red')!
      .attributes('aria-disabled'),
  ).toBe('false')
})

it('discards Add drafts through close, Escape and backdrop while inside clicks preserve the form', async () => {
  const { screen } = await renderApp('/pots')
  for (const dismissal of ['close', 'escape', 'backdrop']) {
    await screen.get('header button').trigger('click')
    const dialog = screen.get('[role="dialog"]')
    expect(dialog.get('input').element.value).toBe('')
    expect(dialog.get<HTMLInputElement>('input[inputmode="decimal"]').element.value).toBe('')
    expect(dialog.get('[role="combobox"]').text()).toBe('Red')
    await dialog.get('input').setValue('Canceled goal')
    await dialog.get('input[inputmode="decimal"]').setValue('50')
    await dialog.get('h2').trigger('click')
    expect(screen.find('[role="dialog"]').exists()).toBe(true)
    await dialog.get('[role="combobox"]').trigger('click')
    await dialog.get('[role="combobox"]').trigger('keydown', { key: 'Escape' })
    expect(dialog.find('[role="listbox"]').exists()).toBe(false)
    expect(screen.find('[role="dialog"]').exists()).toBe(true)
    if (dismissal === 'close') await dialog.get('[aria-label="Close dialog"]').trigger('click')
    else if (dismissal === 'escape') {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await flushPromises()
    } else {
      dialog.element.parentElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    }
    await flushPromises()
    expect(screen.find('[role="dialog"]').exists()).toBe(false)
    expect(screen.findAll('article')).toHaveLength(5)
  }
})

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
    screen
      .findAll('article button')
      .filter((button) => button.text() === 'Withdraw')
      .every((button) => button.attributes('disabled') === undefined),
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
