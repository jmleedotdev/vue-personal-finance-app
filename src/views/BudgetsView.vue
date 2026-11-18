<script setup lang="ts">
import { storeToRefs } from 'pinia'
import BudgetChart from '@/components/BudgetChart.vue'
import BudgetCard from '@/components/BudgetCard.vue'
import { useBudgetsStore, budgetReportingPeriod } from '@/stores/budgets'
import { formatCurrency } from '@/utils/currency'

const { categories } = storeToRefs(useBudgetsStore())
</script>

<template>
  <main
    id="main-content"
    tabindex="-1"
    class="mx-auto flex w-full max-w-[1520px] min-w-0 flex-col gap-8 px-4 pt-6 pb-[calc(84px+env(safe-area-inset-bottom))] md:px-10 md:pt-8 md:pb-[calc(109px+env(safe-area-inset-bottom))] xl:pb-8"
  >
    <h1 class="text-preset-1 md:flex md:h-14 md:items-center">Budgets</h1>
    <div class="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
      <section
        aria-labelledby="spending-summary-heading"
        class="grid min-w-0 items-center gap-8 rounded-xl bg-white px-5 py-6 md:grid-cols-2 md:p-8 xl:grid-cols-1"
      >
        <div class="py-6">
          <BudgetChart :categories="categories" :reporting-period="budgetReportingPeriod" />
        </div>
        <div class="min-w-0">
          <h2 id="spending-summary-heading" class="mb-6 text-preset-2">Spending Summary</h2>
          <ul aria-label="Budget categories" class="divide-y divide-gray-100">
            <li
              v-for="budget in categories"
              :key="budget.id"
              class="flex min-w-0 items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
            >
              <span
                class="min-w-0 border-l-4 pl-4 wrap-break-word text-gray-500"
                :style="{ borderColor: budget.theme }"
                >{{ budget.category }}</span
              >
              <span class="shrink-0 text-right">
                <span class="text-preset-3">{{ formatCurrency(budget.spent) }}</span>
                <span class="ml-2 inline-block text-preset-5 text-gray-500"
                  >of {{ formatCurrency(budget.maximum) }}</span
                >
              </span>
            </li>
          </ul>
        </div>
      </section>
      <div v-if="categories.length" class="flex min-w-0 flex-col gap-6">
        <BudgetCard v-for="budget in categories" :key="budget.id" :budget="budget" />
      </div>
      <section
        v-else
        aria-labelledby="empty-budgets-heading"
        class="rounded-xl bg-white px-5 py-6 md:p-8"
      >
        <h2 id="empty-budgets-heading" class="text-preset-2">No budgets yet</h2>
        <p class="mt-4 text-gray-500">
          Add a budget to start tracking spending against a monthly limit.
        </p>
      </section>
    </div>
  </main>
</template>
