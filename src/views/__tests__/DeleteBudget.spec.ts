import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import { routes } from '@/router'
import demo from '@/data/demo.json'
import { budgetThemes } from '@/utils/budgetThemes'

const originalBudgets = structuredClone(demo.budgets)
const originalTransactions = structuredClone(demo.transactions)
const screens: ReturnType<typeof mount>[] = []
afterEach(() => {
  screens.splice(0).forEach((screen) => screen.unmount())
  document.body.innerHTML = ''
  demo.budgets.splice(0, demo.budgets.length, ...structuredClone(originalBudgets))
  demo.transactions.splice(0, demo.transactions.length, ...structuredClone(originalTransactions))
})

async function renderApp() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/budgets')
  const host = document.createElement('div')
  document.body.append(host)
  const screen = mount(App, { attachTo: host, global: { plugins: [createPinia(), router] } })
  screens.push(screen)
  await flushPromises()
  return { screen, router }
}

async function openDelete(screen: ReturnType<typeof mount>, category: string) {
  const trigger = screen.get<HTMLButtonElement>(`button[aria-label="Manage ${category} budget"]`)
  trigger.element.focus()
  await trigger.trigger('click')
  await screen
    .findAll('[role="menuitem"]')
    .find((item) => item.text() === 'Delete Budget')!
    .trigger('click')
  await flushPromises()
  return screen.get('[role="dialog"]')
}

async function confirmDelete(screen: ReturnType<typeof mount>, category: string) {
  const dialog = await openDelete(screen, category)
  await dialog
    .findAll('button')
    .find((button) => button.text() === 'Yes, Confirm Deletion')!
    .trigger('click')
  await flushPromises()
}

describe('Delete Budget journeys', () => {
  it.each(['cancel', 'close', 'Escape', 'backdrop'])(
    'cancels through %s without changes and restores focus, background and scrolling',
    async (path) => {
      const { screen, router } = await renderApp()
      const dialog = await openDelete(screen, 'Bills')
      expect(dialog.get('h2').text()).toBe('Delete ‘Bills’?')
      expect(document.body.style.overflow).toBe('hidden')
      await dialog.trigger('click')
      expect(screen.find('[role="dialog"]').exists()).toBe(true)
      if (path === 'cancel')
        await dialog
          .findAll('button')
          .find((button) => button.text() === 'No, Go Back')!
          .trigger('click')
      if (path === 'close') await dialog.get('[aria-label="Close dialog"]').trigger('click')
      if (path === 'Escape')
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      if (path === 'backdrop')
        dialog.element.parentElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await flushPromises()
      expect(screen.find('[role="dialog"]').exists()).toBe(false)
      expect(document.activeElement).toBe(screen.get('[aria-label="Manage Bills budget"]').element)
      expect(document.body.style.overflow).toBe('')
      expect(document.documentElement.style.overflow).toBe('')
      expect(screen.get('header').element.closest('[inert]')).toBeNull()
      expect(screen.findAll('article')).toHaveLength(4)
      await router.push('/')
      await flushPromises()
      expect(screen.get('[role="img"]').attributes('aria-label')).toBe(
        'August 2024 budget spending: $338 spent of $975 limit.',
      )
      expect(demo.transactions).toEqual(originalTransactions)
    },
  )

  it('deletes the final Budget, focuses Add, shows zero totals on both pages and adds again', async () => {
    const { screen, router } = await renderApp()
    for (const category of ['Entertainment', 'Bills', 'Dining Out', 'Personal Care']) {
      await confirmDelete(screen, category)
      expect(document.activeElement).toBe(screen.get('[aria-label="Add New Budget"]').element)
    }
    expect(screen.findAll('article')).toHaveLength(0)
    expect(screen.text()).toContain('No budgets yet')
    expect(screen.text()).toContain('Add a budget to start tracking spending')
    expect(screen.get('[role="img"]').attributes('aria-label')).toBe(
      'August 2024 budget spending: $0 spent of $0 limit.',
    )
    expect(screen.get('[role="img"]').findAll('path')).toHaveLength(0)
    await router.push('/')
    await flushPromises()
    expect(screen.get('section[aria-labelledby="budgets-heading"]').text()).toContain(
      '$0of $0 limit',
    )
    expect(screen.get('[role="img"]').attributes('aria-label')).toBe(
      'August 2024 budget spending: $0 spent of $0 limit.',
    )
    await router.push('/budgets')
    await flushPromises()
    await screen.get('[aria-label="Add New Budget"]').trigger('click')
    const dialog = screen.get('[role="dialog"]')
    expect(dialog.get('[role="combobox"]').text()).toBe('Bills')
    expect(dialog.findAll('[role="combobox"]')[1]!.text()).toBe('Green')
    await dialog.get('input').setValue('200')
    await dialog.get('form').trigger('submit')
    expect(
      screen
        .get('article')
        .findAll('dd')
        .map((dd) => dd.text()),
    ).toEqual(['$200.00', '$150.00', '$50.00'])
    expect(screen.get('[role="img"]').attributes('aria-label')).toBe(
      'August 2024 budget spending: $150 spent of $200 limit.',
    )
    expect(screen.get('[role="img"]').findAll('path').length).toBeGreaterThan(0)
    expect(demo.transactions).toEqual(originalTransactions)
    const fresh = await renderApp()
    expect(fresh.screen.findAll('article')).toHaveLength(4)
  })

  it.each(['categories', 'themes'])(
    'recovers from %s exhaustion and reuses the released category and theme',
    async (resource) => {
      const colors = resource === 'themes' ? budgetThemes : budgetThemes.slice(0, 1)
      demo.budgets.splice(
        0,
        demo.budgets.length,
        ...colors.map((theme, index) => ({
          id: `budget-${index}`,
          category: `Category ${index}`,
          maximum: 10,
          theme: theme.value,
        })),
      )
      demo.transactions.splice(
        0,
        demo.transactions.length,
        ...demo.budgets.map((budget) => ({
          ...originalTransactions[0]!,
          category: budget.category,
        })),
      )
      if (resource === 'themes')
        demo.transactions.push({ ...originalTransactions[0]!, category: 'Unused' })
      const { screen } = await renderApp()
      expect(screen.get('[aria-label="Add New Budget"]').attributes('disabled')).toBeDefined()
      await confirmDelete(screen, 'Category 0')
      const add = screen.get('[aria-label="Add New Budget"]')
      expect(add.attributes('disabled')).toBeUndefined()
      expect(document.activeElement).toBe(add.element)
      await add.trigger('click')
      const dialog = screen.get('[role="dialog"]')
      expect(dialog.get('[role="combobox"]').text()).toBe('Category 0')
      expect(dialog.findAll('[role="combobox"]')[1]!.text()).toBe('Green')
      await dialog.get('input').setValue('25')
      await dialog.get('form').trigger('submit')
      const cards = screen.findAll('article')
      expect(cards[cards.length - 1]!.get('h2').text()).toBe('Category 0')
      expect(cards[cards.length - 1]!.get('dd').text()).toBe('$25.00')
      expect(screen.get('[aria-label="Add New Budget"]').attributes('disabled')).toBeDefined()
    },
  )
})
