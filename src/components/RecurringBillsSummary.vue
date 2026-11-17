<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue'
import demo from '@/data/demo.json'
import { formatCurrency } from '@/utils/currency'
import { summarizeRecurringBills } from '@/utils/recurringBills'

const reportingDate = '2024-08-19'
const totals = summarizeRecurringBills(demo.transactions, reportingDate)
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
      <BaseButton
        variant="tertiary"
        trailing-caret
        disabled
        aria-describedby="recurring-bills-unavailable"
        class="shrink-0"
      >
        See Details
      </BaseButton>
      <p id="recurring-bills-unavailable" class="sr-only">
        The Recurring Bills page is not available yet.
      </p>
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
