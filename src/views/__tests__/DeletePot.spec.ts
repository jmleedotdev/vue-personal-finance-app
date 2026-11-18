import { afterEach, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import { routes } from '@/router'
import demo from '@/data/demo.json'
import { budgetThemes } from '@/utils/budgetThemes'

const original = structuredClone(demo)
const screens: ReturnType<typeof mount>[] = []
afterEach(() => {
  screens.splice(0).forEach((screen) => screen.unmount())
  Object.assign(demo, structuredClone(original))
})
async function renderApp() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/pots')
  const screen = mount(App, { global: { plugins: [createPinia(), router] } })
  screens.push(screen)
  await flushPromises()
  return { screen, router }
}
async function openDelete(screen: ReturnType<typeof mount>, name = 'Savings') {
  await screen.get(`[aria-label="Manage ${name} pot"]`).trigger('click')
  await screen
    .findAll('[role="menuitem"]')
    .find((item) => item.text() === 'Delete Pot')!
    .trigger('click')
  await flushPromises()
  expect(screen.find('[role="menu"]').exists()).toBe(false)
  return screen.get('[role="dialog"]')
}
async function createPot(screen: ReturnType<typeof mount>, name: string, target = '100') {
  await screen.get('[aria-label="Add New Pot"]').trigger('click')
  const dialog = screen.get('[role="dialog"]')
  await dialog.get('input').setValue(name)
  await dialog.get('input[inputmode="decimal"]').setValue(target)
  await dialog.get('form').trigger('submit')
}
function confirm(screen: ReturnType<typeof mount>) {
  return screen
    .get('[role="dialog"]')
    .findAll('button')
    .find((button) => button.text() === 'Yes, Confirm Deletion')!
}
async function visit(router: Awaited<ReturnType<typeof renderApp>>['router'], path: string) {
  await router.push(path)
  await flushPromises()
}

it('confirms the intended funded pot and return amount, commits once, conserves cents and retains session changes', async () => {
  const { screen, router } = await renderApp()
  await visit(router, '/transactions')
  const transactions = screen.get('main').text()
  await visit(router, '/budgets')
  const budgets = screen.get('main').text()
  await visit(router, '/pots')
  const dialog = await openDelete(screen, 'Concert Ticket')
  expect(dialog.get('h2').text()).toBe('Delete ‘Concert Ticket’?')
  expect(dialog.text()).toContain('$110.00 will be returned to your Current Balance')
  const button = confirm(screen)
  await Promise.all([button.trigger('click'), button.trigger('click')])
  expect(screen.find('[role="dialog"]').exists()).toBe(false)
  expect(screen.findAll('article h2').map((heading) => heading.text())).toEqual([
    'Savings',
    'Gift',
    'New Laptop',
    'Holiday',
  ])
  await visit(router, '/')
  expect(screen.get('[aria-label="Balance summaries"]').text()).toBe(
    'Current Balance$4,946.00Income$3,814.25Expenses$1,700.50',
  )
  const summary = screen.get('section[aria-labelledby="pots-heading"]')
  expect(summary.text()).toContain('Total Saved$810')
  expect(summary.text()).not.toContain('Concert Ticket')
  await visit(router, '/transactions')
  expect(screen.get('main').text()).toBe(transactions)
  await visit(router, '/budgets')
  expect(screen.get('main').text()).toBe(budgets)
  await visit(router, '/pots')
  expect(screen.findAll('article')).toHaveLength(4)
  const fresh = await renderApp()
  expect(fresh.screen.findAll('article')).toHaveLength(5)
  await visit(fresh.router, '/')
  expect(fresh.screen.get('[aria-label="Balance summaries"]').text()).toContain(
    'Current Balance$4,836.00',
  )
  expect(demo).toEqual(original)
})

it('leaves pots and funds untouched through Cancel, Close, Escape and backdrop dismissal', async () => {
  const { screen, router } = await renderApp()
  for (const dismissal of ['cancel', 'close', 'escape', 'backdrop']) {
    const dialog = await openDelete(screen)
    expect(dialog.text()).toContain('$159.00 will be returned to your Current Balance')
    await dialog.get('h2').trigger('click')
    expect(screen.find('[role="dialog"]').exists()).toBe(true)
    if (dismissal === 'close') await dialog.get('[aria-label="Close dialog"]').trigger('click')
    else if (dismissal === 'cancel')
      await dialog
        .findAll('button')
        .find((button) => button.text() === 'No, Go Back')!
        .trigger('click')
    else if (dismissal === 'escape')
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    else dialog.element.parentElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()
    expect(screen.find('[role="dialog"]').exists()).toBe(false)
    expect(screen.findAll('article')).toHaveLength(5)
    expect(screen.get('article dd').text()).toBe('$159.00')
  }
  await visit(router, '/')
  expect(screen.get('[aria-label="Balance summaries"]').text()).toContain(
    'Current Balance$4,836.00',
  )
})

it('deletes every funded pot, clears Overview help and entries, then reuses a released name and theme at zero savings', async () => {
  const { screen, router } = await renderApp()
  for (const pot of original.pots) {
    await openDelete(screen, pot.name)
    await confirm(screen).trigger('click')
  }
  expect(screen.findAll('article')).toHaveLength(0)
  expect(screen.get('main').text()).toContain('No pots yet')
  expect(screen.get('main').text()).toContain('Create a pot')
  await visit(router, '/')
  const summary = screen.get('section[aria-labelledby="pots-heading"]')
  expect(summary.text()).toContain('Total Saved$0')
  expect(summary.findAll('li')).toHaveLength(0)
  expect(summary.text()).not.toContain('Use arrow keys')
  expect(summary.find('[tabindex="0"]').exists()).toBe(false)
  expect(screen.get('[aria-label="Balance summaries"]').text()).toBe(
    'Current Balance$5,756.00Income$3,814.25Expenses$1,700.50',
  )
  await visit(router, '/pots')
  await screen.get('[aria-label="Add New Pot"]').trigger('click')
  let dialog = screen.get('[role="dialog"]')
  expect(dialog.get('[role="combobox"]').text()).toBe('Green')
  await dialog.get('input').setValue('Savings')
  await dialog.get('input[inputmode="decimal"]').setValue('100')
  await dialog.get('form').trigger('submit')
  expect(screen.get('article dd').text()).toBe('$0.00')
  dialog = await openDelete(screen)
  expect(dialog.text()).toContain('$0.00 will be returned to your Current Balance')
  await confirm(screen).trigger('click')
  await visit(router, '/')
  expect(screen.get('[aria-label="Balance summaries"]').text()).toContain(
    'Current Balance$5,756.00',
  )
})

it('recovers an exhausted palette through deletion and permits the deleted name and theme again', async () => {
  const { screen } = await renderApp()
  for (let index = 0; index < 10; index++) await createPot(screen, `Extra ${index}`)
  const add = screen.get('[aria-label="Add New Pot"]')
  expect(screen.findAll('article')).toHaveLength(budgetThemes.length)
  expect(add.attributes('disabled')).toBeDefined()
  expect(add.attributes('aria-describedby')).toBeUndefined()
  await openDelete(screen)
  await confirm(screen).trigger('click')
  expect(add.attributes('disabled')).toBeUndefined()
  await add.trigger('click')
  const dialog = screen.get('[role="dialog"]')
  expect(dialog.get('[role="combobox"]').text()).toBe('Green')
  await dialog.get('input').setValue('  sAvInGs  ')
  await dialog.get('input[inputmode="decimal"]').setValue('10')
  await dialog.get('form').trigger('submit')
  expect(screen.find('[role="dialog"]').exists()).toBe(false)
  expect(screen.findAll('article dd')[14]!.text()).toBe('$0.00')
  expect(add.attributes('disabled')).toBeDefined()
})

it('returns saved cents and makes them available to Add Money without changing other funds', async () => {
  demo.balance.current = 0
  demo.pots[0]!.total = 159.01
  const { screen, router } = await renderApp()
  let addMoney = screen
    .findAll('article button')
    .filter((button) => button.text() === '+ Add Money')
  expect(addMoney.every((button) => button.attributes('disabled') !== undefined)).toBe(true)
  expect(addMoney.every((button) => button.attributes('aria-describedby') === undefined)).toBe(true)
  const dialog = await openDelete(screen)
  expect(dialog.text()).toContain('$159.01 will be returned')
  await confirm(screen).trigger('click')
  addMoney = screen.findAll('article button').filter((button) => button.text() === '+ Add Money')
  expect(addMoney.every((button) => button.attributes('disabled') === undefined)).toBe(true)
  await addMoney[0]!.trigger('click')
  await screen.get('[role="dialog"] input').setValue('159.01')
  await screen.get('form').trigger('submit')
  expect(screen.get('article dd').text()).toBe('$269.01')
  await visit(router, '/')
  expect(screen.get('[aria-label="Balance summaries"]').text()).toContain('Current Balance$0.00')
})

it('keeps an unsafe deletion open with an error and changes neither side', async () => {
  demo.balance.current = 70368744177664
  demo.pots[0]!.total = 0.01
  const { screen, router } = await renderApp()
  await openDelete(screen)
  await confirm(screen).trigger('click')
  expect(screen.get('[role="alert"]').text()).toContain('safe monetary values')
  expect(screen.findAll('article')).toHaveLength(5)
  expect(screen.get('article dd').text()).toBe('$0.01')
  await screen.get('[aria-label="Close dialog"]').trigger('click')
  await visit(router, '/')
  expect(screen.get('[aria-label="Balance summaries"]').text()).toContain(
    'Current Balance$70,368,744,177,664.00',
  )
})
