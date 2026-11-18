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

function potCard(screen: ReturnType<typeof mount>, name: string) {
  return screen.findAll('article').find((card) => card.get('h2').text() === name)!
}
function additionButton(card: ReturnType<typeof potCard>) {
  return card.findAll('button').find((button) => button.text() === '+ Add Money')!
}
async function openAddition(screen: ReturnType<typeof mount>, name = 'Savings') {
  await additionButton(potCard(screen, name)).trigger('click')
}

it('previews a selected pot without committing, then transfers once and synchronizes Overview', async () => {
  const { screen, router } = await renderApp()
  const card = potCard(screen, 'Concert Ticket')
  await openAddition(screen, 'Concert Ticket')
  const dialog = screen.get('[role="dialog"]')
  expect(dialog.get('h2').text()).toBe('Add to ‘Concert Ticket’')
  expect(dialog.get('input').element.value).toBe('')
  expect(dialog.get('dd').text()).toBe('$110.00')
  await dialog.get('input').setValue('40.01')
  expect(dialog.get('dd').text()).toBe('$150.01')
  expect(dialog.text()).toContain('100.01%')
  expect(card.get('dd').text()).toBe('$110.00')
  const form = dialog.get('form')
  await Promise.all([form.trigger('submit'), form.trigger('submit')])
  expect(screen.find('[role="dialog"]').exists()).toBe(false)
  expect(screen.findAll('article dd').map((value) => value.text())).toEqual([
    '$159.00',
    '$150.01',
    '$110.00',
    '$10.00',
    '$531.00',
  ])
  await router.push('/')
  await flushPromises()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toBe(
    'Current Balance$4,795.99Income$3,814.25Expenses$1,700.50',
  )
  expect(screen.get('section[aria-labelledby="pots-heading"]').text()).toContain('Total Saved$960')
  expect(demo).toEqual(original)
  await router.push('/pots')
  await flushPromises()
  expect(screen.findAll('article dd')[1]!.text()).toBe('$150.01')
  const fresh = await renderApp()
  expect(fresh.screen.findAll('article dd')[1]!.text()).toBe('$110.00')
})

it('rejects invalid drafts without rounding or mutation, supports correction and exact balance exhaustion', async () => {
  const { screen, router } = await renderApp()
  await openAddition(screen)
  const dialog = screen.get('[role="dialog"]')
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
    '4836.01',
  ]) {
    await dialog.get('input').setValue(input)
    expect(dialog.get('dd').text()).toBe('$159.00')
    await dialog.get('form').trigger('submit')
    expect(dialog.get('input').attributes('aria-invalid')).toBe('true')
    expect(dialog.text()).toContain('Enter an amount')
    expect(screen.get('article dd').text()).toBe('$159.00')
  }
  await dialog.get('input').setValue('4836')
  expect(dialog.get('dd').text()).toBe('$4,995.00')
  expect(dialog.text()).toContain('249.75%')
  await dialog.get('form').trigger('submit')
  expect(screen.get('article dd').text()).toBe('$4,995.00')
  for (const card of screen.findAll('article')) {
    const add = additionButton(card)
    expect(add.attributes('disabled')).toBeDefined()
    expect(add.attributes('aria-describedby')).toBeUndefined()
  }
  await router.push('/')
  await flushPromises()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toBe(
    'Current Balance$0.00Income$3,814.25Expenses$1,700.50',
  )
  expect(screen.get('section[aria-labelledby="pots-heading"]').text()).toContain(
    'Total Saved$5,756',
  )
})

it('conserves explicit financial totals through repeated cent additions and leaves other features unchanged', async () => {
  const { screen, router } = await renderApp()
  await router.push('/transactions')
  await flushPromises()
  const transactions = screen.get('main').text()
  await router.push('/budgets')
  await flushPromises()
  const budgets = screen.get('main').text()
  await router.push('/pots')
  await flushPromises()
  for (const expected of ['$159.01', '$159.02', '$159.03']) {
    await openAddition(screen)
    const dialog = screen.get('[role="dialog"]')
    await dialog.get('input').setValue('.01')
    expect(dialog.get('dd').text()).toBe(expected)
    await dialog.get('form').trigger('submit')
    expect(screen.get('article dd').text()).toBe(expected)
  }
  await router.push('/')
  await flushPromises()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toBe(
    'Current Balance$4,835.97Income$3,814.25Expenses$1,700.50',
  )
  expect(screen.get('section[aria-labelledby="pots-heading"]').text()).toContain('Total Saved$920')
  await router.push('/pots')
  await flushPromises()
  const savedAmounts = screen
    .findAll('article dd')
    .map((value) => Number(value.text().replace(/[$,]/g, '')))
  expect(savedAmounts).toEqual([159.03, 110, 110, 10, 531])
  expect(savedAmounts.reduce((sum, amount) => sum + Math.round(amount * 100), 483597)).toBe(575600)
  await router.push('/transactions')
  await flushPromises()
  expect(screen.get('main').text()).toBe(transactions)
  await router.push('/budgets')
  await flushPromises()
  expect(screen.get('main').text()).toBe(budgets)
})

it('discards previews through Close, Escape and backdrop and reopens with fresh saved state', async () => {
  const { screen, router } = await renderApp()
  for (const dismissal of ['close', 'escape', 'backdrop']) {
    await openAddition(screen)
    const dialog = screen.get('[role="dialog"]')
    expect(dialog.get('input').element.value).toBe('')
    expect(dialog.get('dd').text()).toBe('$159.00')
    await dialog.get('input').setValue('400')
    expect(dialog.get('dd').text()).toBe('$559.00')
    expect(dialog.text()).toContain('27.95%')
    if (dismissal === 'close') await dialog.get('[aria-label="Close dialog"]').trigger('click')
    else if (dismissal === 'escape')
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    else dialog.element.parentElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()
    expect(screen.find('[role="dialog"]').exists()).toBe(false)
    expect(screen.get('article dd').text()).toBe('$159.00')
  }
  await router.push('/')
  await flushPromises()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toContain(
    'Current Balance$4,836.00',
  )
  expect(screen.get('section[aria-labelledby="pots-heading"]').text()).toContain('Total Saved$920')
})

it('previews near-zero, exact target and already-over-target savings truthfully', async () => {
  demo.pots[0]!.total = 0
  demo.pots[0]!.target = 1
  const { screen } = await renderApp()
  let savedPreview = '$0.00'
  for (const [input, total, percentage] of [
    ['.01', '$0.01', '1%'],
    ['.99', '$1.00', '100%'],
    ['.01', '$1.01', '101%'],
    ['.01', '$1.02', '102%'],
  ]) {
    await openAddition(screen)
    const dialog = screen.get('[role="dialog"]')
    expect(dialog.get('dd').text()).toBe(savedPreview)
    await dialog.get('input').setValue(input!)
    expect(dialog.get('dd').text()).toBe(total)
    expect(dialog.text()).toContain(percentage)
    await dialog.get('form').trigger('submit')
    expect(potCard(screen, 'Savings').get('dd').text()).toBe(total)
    savedPreview = total!
  }
})

it('rejects an unsafe resulting saved value without moving either side', async () => {
  demo.pots[0]!.total = 90071992547409.9
  const { screen, router } = await renderApp()
  await openAddition(screen)
  const dialog = screen.get('[role="dialog"]')
  await dialog.get('input').setValue('1')
  await dialog.get('form').trigger('submit')
  expect(dialog.text()).toContain('safe monetary values')
  expect(dialog.get('dd').text()).toBe('$90,071,992,547,409.90')
  await dialog.get('[aria-label="Close dialog"]').trigger('click')
  await router.push('/')
  await flushPromises()
  expect(screen.get('[aria-label="Balance summaries"]').text()).toContain(
    'Current Balance$4,836.00',
  )
})
