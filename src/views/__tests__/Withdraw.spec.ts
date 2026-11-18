import { afterEach, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import { routes } from '@/router'
import demo from '@/data/demo.json'

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
function card(screen: ReturnType<typeof mount>, name = 'Savings') {
  return screen.findAll('article').find((item) => item.get('h2').text() === name)!
}
function action(screen: ReturnType<typeof mount>, name = 'Savings', label = 'Withdraw') {
  return card(screen, name)
    .findAll('button')
    .find((button) => button.text() === label)!
}
async function openWithdrawal(screen: ReturnType<typeof mount>, name = 'Savings') {
  await action(screen, name).trigger('click')
  return screen.get('[role="dialog"]')
}

it('previews selected-pot cents without mutation, commits once, retains routes and resets a fresh instance', async () => {
  const { screen, router } = await renderApp()
  const dialog = await openWithdrawal(screen, 'Concert Ticket')
  expect(dialog.get('h2').text()).toBe('Withdraw from ‘Concert Ticket’')
  expect(dialog.get('input').element.value).toBe('')
  expect(dialog.get('dd').text()).toBe('$110.00')
  await dialog.get('input').setValue('40.01')
  expect(dialog.get('dd').text()).toBe('$69.99')
  expect(dialog.text()).toContain('46.66%')
  expect(card(screen, 'Concert Ticket').get('dd').text()).toBe('$110.00')
  const form = dialog.get('form')
  await Promise.all([form.trigger('submit'), form.trigger('submit')])
  expect(screen.find('[role="dialog"]').exists()).toBe(false)
  expect(screen.findAll('article dd').map((value) => value.text())).toEqual([
    '$159.00',
    '$69.99',
    '$110.00',
    '$10.00',
    '$531.00',
  ])
  await router.push('/')
  await flushPromises()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toBe(
    'Current Balance$4,876.01Income$3,814.25Expenses$1,700.50',
  )
  expect(screen.get('section[aria-labelledby="pots-heading"]').text()).toContain('Total Saved$880')
  await router.push('/pots')
  await flushPromises()
  expect(card(screen, 'Concert Ticket').get('dd').text()).toBe('$69.99')
  const fresh = await renderApp()
  expect(card(fresh.screen, 'Concert Ticket').get('dd').text()).toBe('$110.00')
  expect(demo).toEqual(original)
})

it('rejects invalid amounts and overdraw without clamping, then withdraws the full savings while keeping the goal', async () => {
  const { screen, router } = await renderApp()
  const dialog = await openWithdrawal(screen)
  for (const input of [
    '',
    '0',
    '-1',
    'no money',
    'NaN',
    'Infinity',
    '1e2',
    '1.001',
    '9007199254740992',
    '159.01',
  ]) {
    await dialog.get('input').setValue(input)
    expect(dialog.get('dd').text()).toBe('$159.00')
    await dialog.get('form').trigger('submit')
    expect(dialog.get('input').attributes('aria-invalid')).toBe('true')
    expect(dialog.text()).toContain('Enter an amount')
    expect(card(screen).get('dd').text()).toBe('$159.00')
  }
  await dialog.get('input').setValue('159')
  expect(dialog.get('dd').text()).toBe('$0.00')
  expect(dialog.text()).toContain('0%')
  await dialog.get('form').trigger('submit')
  expect(card(screen).get('dd').text()).toBe('$0.00')
  expect(card(screen).text()).toContain('Target of $2,000.00')
  expect(action(screen).attributes('disabled')).toBeDefined()
  expect(action(screen).attributes('aria-describedby')).toBeUndefined()
  expect(screen.findAll('article')).toHaveLength(5)
  await router.push('/')
  await flushPromises()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toBe(
    'Current Balance$4,995.00Income$3,814.25Expenses$1,700.50',
  )
  expect(screen.get('section[aria-labelledby="pots-heading"]').text()).toContain('Total Saved$761')
})

it('discards Close, Escape and backdrop drafts, reopening with blank input and persisted savings', async () => {
  const { screen, router } = await renderApp()
  for (const dismissal of ['close', 'escape', 'backdrop']) {
    const dialog = await openWithdrawal(screen)
    expect(dialog.get('input').element.value).toBe('')
    expect(dialog.get('dd').text()).toBe('$159.00')
    await dialog.get('input').setValue('20')
    expect(dialog.get('dd').text()).toBe('$139.00')
    expect(dialog.text()).toContain('6.95%')
    if (dismissal === 'close') await dialog.get('[aria-label="Close dialog"]').trigger('click')
    else if (dismissal === 'escape')
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    else dialog.element.parentElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()
    expect(screen.find('[role="dialog"]').exists()).toBe(false)
    expect(card(screen).get('dd').text()).toBe('$159.00')
  }
  await router.push('/')
  await flushPromises()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toContain(
    'Current Balance$4,836.00',
  )
})

it('conserves explicit totals through repeated cent withdrawals and add/withdraw round trips without changing other features', async () => {
  const { screen, router } = await renderApp()
  await router.push('/transactions')
  await flushPromises()
  const transactions = screen.get('main').text()
  await router.push('/budgets')
  await flushPromises()
  const budgets = screen.get('main').text()
  await router.push('/pots')
  await flushPromises()
  for (const expected of ['$158.99', '$158.98', '$158.97']) {
    const dialog = await openWithdrawal(screen)
    await dialog.get('input').setValue('.01')
    expect(dialog.get('dd').text()).toBe(expected)
    await dialog.get('form').trigger('submit')
    expect(card(screen).get('dd').text()).toBe(expected)
  }
  await router.push('/')
  await flushPromises()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toBe(
    'Current Balance$4,836.03Income$3,814.25Expenses$1,700.50',
  )
  expect(screen.get('section[aria-labelledby="pots-heading"]').text()).toContain('Total Saved$920')
  await router.push('/pots')
  await flushPromises()
  expect(screen.findAll('article dd').map((value) => value.text())).toEqual([
    '$158.97',
    '$110.00',
    '$110.00',
    '$10.00',
    '$531.00',
  ])
  const savedCents = screen
    .findAll('article dd')
    .map((value) => Math.round(Number(value.text().replace(/[$,]/g, '')) * 100))
  expect(savedCents.reduce((sum, cents) => sum + cents, 483603)).toBe(575600)
  await action(screen, 'Savings', '+ Add Money').trigger('click')
  let dialog = screen.get('[role="dialog"]')
  await dialog.get('input').setValue('.03')
  await dialog.get('form').trigger('submit')
  expect(card(screen).get('dd').text()).toBe('$159.00')
  await action(screen, 'Savings', '+ Add Money').trigger('click')
  dialog = screen.get('[role="dialog"]')
  await dialog.get('input').setValue('4836')
  await dialog.get('form').trigger('submit')
  expect(action(screen, 'Savings', '+ Add Money').attributes('disabled')).toBeDefined()
  dialog = await openWithdrawal(screen)
  expect(dialog.get('dd').text()).toBe('$4,995.00')
  await dialog.get('input').setValue('4836')
  expect(dialog.get('dd').text()).toBe('$159.00')
  expect(dialog.text()).toContain('7.95%')
  await dialog.get('form').trigger('submit')
  expect(action(screen, 'Savings', '+ Add Money').attributes('disabled')).toBeUndefined()
  await router.push('/')
  await flushPromises()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toBe(
    'Current Balance$4,836.00Income$3,814.25Expenses$1,700.50',
  )
  expect(screen.get('section[aria-labelledby="pots-heading"]').text()).toContain('Total Saved$920')
  await router.push('/transactions')
  await flushPromises()
  expect(screen.get('main').text()).toBe(transactions)
  await router.push('/budgets')
  await flushPromises()
  expect(screen.get('main').text()).toBe(budgets)
})

it('rejects lossy balance conversion even when the intended cents are a safe integer', async () => {
  demo.balance.current = 70368744177664
  const { screen, router } = await renderApp()
  const dialog = await openWithdrawal(screen)
  await dialog.get('input').setValue('.01')
  await dialog.get('form').trigger('submit')
  expect(dialog.text()).toContain('safe monetary values')
  expect(dialog.get('dd').text()).toBe('$159.00')
  expect(card(screen).get('dd').text()).toBe('$159.00')
  await dialog.get('[aria-label="Close dialog"]').trigger('click')
  await router.push('/')
  await flushPromises()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toContain(
    'Current Balance$70,368,744,177,664.00',
  )
})

it('rejects unsafe resulting balance without changing savings or balance', async () => {
  demo.balance.current = 90071992547409.9
  const { screen, router } = await renderApp()
  const dialog = await openWithdrawal(screen)
  await dialog.get('input').setValue('1')
  await dialog.get('form').trigger('submit')
  expect(dialog.text()).toContain('safe monetary values')
  expect(dialog.get('dd').text()).toBe('$159.00')
  expect(card(screen).get('dd').text()).toBe('$159.00')
  await dialog.get('[aria-label="Close dialog"]').trigger('click')
  await router.push('/')
  await flushPromises()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toContain(
    'Current Balance$90,071,992,547,409.90',
  )
})
