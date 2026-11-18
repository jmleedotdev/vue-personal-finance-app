import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import demo from '@/data/demo.json'
import { budgetThemes } from '@/utils/budgetThemes'

export const budgetReportingPeriod = 'August 2024'

export const useBudgetsStore = defineStore('budgets', () => {
  const budgets = ref(demo.budgets.map((budget, index) => ({ ...budget, id: `budget-${index}` })))
  const availableCategories = computed(() =>
    [...new Set(demo.transactions.map((transaction) => transaction.category))]
      .sort((a, b) => a.localeCompare(b))
      .filter((category) => !budgets.value.some((budget) => budget.category === category))
      .map((category) => ({ label: category, value: category })),
  )
  const themeOptions = computed(() =>
    budgetThemes.map((theme) => {
      const disabled = budgets.value.some((budget) => budget.theme.toUpperCase() === theme.value)
      return { ...theme, disabled, disabledText: disabled ? 'Already used' : '' }
    }),
  )
  const addUnavailableReason = computed(() =>
    !availableCategories.value.length
      ? 'All transaction categories already have a budget.'
      : !themeOptions.value.some((theme) => !theme.disabled)
        ? 'All budget themes are already used.'
        : '',
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
    budgets.value.push({ ...budget, id: `budget-${budgets.value.length}` })
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
  return { budgets, categories, availableCategories, themeOptions, addUnavailableReason, addBudget }
})

export type BudgetInput = { category: string; maximum: number; theme: string }

export type BudgetSpending = ReturnType<typeof useBudgetsStore>['categories'][number]
