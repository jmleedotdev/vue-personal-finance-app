<script setup lang="ts">
import BudgetChart from '@/components/BudgetChart.vue'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import IconCaretRight from '@/components/icons/IconCaretRight.vue'
import { useBudgetsStore, budgetReportingPeriod } from '@/stores/budgets'
import { formatCurrency } from '@/utils/currency'

const { categories } = storeToRefs(useBudgetsStore())
const hasExtraCategories = computed(() => categories.value.length > 4)
</script>

<template>
  <section aria-labelledby="budgets-heading" class="min-w-0 rounded-xl bg-white px-5 py-6 md:p-8">
    <header class="mb-8 flex items-center justify-between gap-4">
      <h2 id="budgets-heading" class="text-preset-2">Budgets</h2>
      <RouterLink
        to="/budgets"
        class="inline-flex shrink-0 items-center gap-3 rounded-lg text-preset-4 text-gray-500 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-900"
      >
        See Details
        <IconCaretRight />
      </RouterLink>
    </header>
    <div class="grid min-w-0 items-center gap-4 md:min-h-[290px] md:grid-cols-[minmax(0,1fr)_auto]">
      <BudgetChart :categories="categories" :reporting-period="budgetReportingPeriod" />
      <ul
        aria-label="Budget categories"
        :tabindex="hasExtraCategories ? 0 : undefined"
        :aria-describedby="hasExtraCategories ? 'budgets-scroll-help' : undefined"
        class="grid max-h-[102px] min-w-0 auto-rows-[43px] grid-cols-2 gap-4 overflow-y-auto rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green md:max-h-[220px] md:grid-cols-1"
      >
        <li
          v-for="category in categories"
          :key="category.id"
          class="min-w-0 rounded-xs border-l-4 pl-4"
          :style="{ borderColor: category.theme }"
        >
          <p class="text-preset-5 text-gray-500">{{ category.category }}</p>
          <p class="mt-1 text-preset-4 font-bold">{{ formatCurrency(category.maximum) }}</p>
          <p class="sr-only">
            Spent {{ formatCurrency(category.spent) }} of
            {{ formatCurrency(category.maximum) }} limit.
          </p>
        </li>
      </ul>
      <p v-if="hasExtraCategories" id="budgets-scroll-help" class="sr-only">
        Use arrow keys when focused, swipe, or scroll to reach all budget categories.
      </p>
    </div>
  </section>
</template>
