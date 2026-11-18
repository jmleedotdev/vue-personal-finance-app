<script setup lang="ts">
import { RouterLink } from 'vue-router'
import IconCaretRight from '@/components/icons/IconCaretRight.vue'
import demo from '@/data/demo.json'
import { formatCurrency } from '@/utils/currency'
import { REPORTING_DATE, summarizeRecurringBills } from '@/utils/recurringBills'

const totals = summarizeRecurringBills(demo.transactions, REPORTING_DATE)
const summaries = [
  { label: 'Paid Bills', amount: totals.paid, accent: 'border-green' },
  { label: 'Total Upcoming', amount: totals.upcoming, accent: 'border-yellow' },
  { label: 'Due Soon', amount: totals.dueSoon, accent: 'border-cyan' },
]
</script>

<template>
  <section
    aria-labelledby="recurring-bills-heading"
    class="min-w-0 rounded-xl bg-white px-5 py-6 md:p-8"
  >
    <header class="mb-8 flex items-center justify-between gap-4">
      <h2 id="recurring-bills-heading" class="text-preset-2">Recurring Bills</h2>
      <RouterLink
        to="/recurring-bills"
        class="inline-flex shrink-0 items-center gap-3 rounded-lg text-preset-4 text-gray-500 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-900"
      >
        See Details
        <IconCaretRight />
      </RouterLink>
    </header>
    <dl class="flex flex-col gap-3">
      <div
        v-for="summary in summaries"
        :key="summary.label"
        class="flex min-w-0 items-center justify-between gap-4 rounded-lg border-l-4 bg-beige-100 px-4 py-5"
        :class="summary.accent"
      >
        <dt class="text-gray-500">{{ summary.label }}</dt>
        <dd class="shrink-0 text-preset-4 font-bold">{{ formatCurrency(summary.amount) }}</dd>
      </div>
    </dl>
  </section>
</template>
