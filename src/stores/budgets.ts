import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import demo from '@/data/demo.json'
import { budgetThemes } from '@/utils/budgetThemes'

export const budgetReportingPeriod = 'August 2024'

export const useBudgetsStore = defineStore('budgets', () => {
  const budgets = ref(demo.budgets.map((budget) => ({ ...budget })))
  function categoryOptions(editingId?: string) {
    return [...new Set(demo.transactions.map((transaction) => transaction.category))]
      .sort((a, b) => a.localeCompare(b))
      .filter(
        (category) =>
          !budgets.value.some((budget) => budget.id !== editingId && budget.category === category),
      )
      .map((category) => ({ label: category, value: category }))
  }
  const availableCategories = computed(() => categoryOptions())
  function budgetThemeOptions(editingId?: string) {
    return budgetThemes.map((theme) => {
      const disabled = budgets.value.some(
        (budget) => budget.id !== editingId && budget.theme.toUpperCase() === theme.value,
      )
      return { ...theme, disabled, disabledText: disabled ? 'Already used' : '' }
    })
  }
  const themeOptions = computed(() => budgetThemeOptions())
  const canAddBudget = computed(
    () =>
      availableCategories.value.length > 0 && themeOptions.value.some((theme) => !theme.disabled),
  )

  function addBudget(budget: BudgetInput) {
    const cents = budget.maximum * 100
    if (
      !availableCategories.value.some((option) => option.value === budget.category) ||
      !themeOptions.value.some((option) => option.value === budget.theme && !option.disabled) ||
      !Number.isFinite(cents) ||
      !Number.isSafeInteger(Math.round(cents)) ||
      cents <= 0
    )
      return false
    budgets.value.push({ ...budget, id: crypto.randomUUID() })
    return true
  }
  function updateBudget(id: string, input: BudgetInput) {
    const budget = budgets.value.find((budget) => budget.id === id)
    if (
      !budget ||
      !categoryOptions(id).some((option) => option.value === input.category) ||
      !budgetThemeOptions(id).some((option) => option.value === input.theme && !option.disabled) ||
      !Number.isSafeInteger(Math.round(input.maximum * 100)) ||
      input.maximum <= 0
    )
      return false
    Object.assign(budget, input)
    return true
  }
  const categories = computed(() =>
    budgets.value.map((budget) => {
      const outgoing = demo.transactions.filter(
        (transaction) => transaction.amount < 0 && transaction.category === budget.category,
      )
      const spentCents = outgoing.reduce(
        (cents, transaction) =>
          new Date(transaction.date).toISOString().startsWith('2024-08-')
            ? cents + Math.round(-transaction.amount * 100)
            : cents,
        0,
      )
      const maximumCents = Math.round(budget.maximum * 100)
      return {
        ...budget,
        spent: spentCents / 100,
        remaining: Math.max(0, maximumCents - spentCents) / 100,
        progress: maximumCents > 0 ? Math.min(100, (spentCents / maximumCents) * 100) : 0,
        latestSpending: outgoing
          .map((transaction, index) => ({
            ...transaction,
            index,
            calendarDate: new Date(transaction.date).toISOString().slice(0, 10),
          }))
          .sort((a, b) => b.calendarDate.localeCompare(a.calendarDate) || a.index - b.index)
          .slice(0, 3),
      }
    }),
  )
  return {
    budgets,
    categories,
    availableCategories,
    themeOptions,
    canAddBudget,
    addBudget,
    categoryOptions,
    budgetThemeOptions,
    updateBudget,
  }
})

export type BudgetInput = { category: string; maximum: number; theme: string }

export type BudgetSpending = ReturnType<typeof useBudgetsStore>['categories'][number]
