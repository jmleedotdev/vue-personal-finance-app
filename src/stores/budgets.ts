import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import demo from '@/data/demo.json'

export const budgetReportingPeriod = 'August 2024'

export const useBudgetsStore = defineStore('budgets', () => {
  const budgets = ref(demo.budgets.map((budget, index) => ({ ...budget, id: `budget-${index}` })))
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
  return { budgets, categories }
})

export type BudgetSpending = ReturnType<typeof useBudgetsStore>['categories'][number]
