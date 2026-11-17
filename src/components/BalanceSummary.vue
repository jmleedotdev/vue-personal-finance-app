<script setup lang="ts">
import demo from '@/data/demo.json'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const summaries = [
  { label: 'Current Balance', value: demo.balance.current, primary: true },
  { label: 'Income', value: demo.balance.income, primary: false },
  { label: 'Expenses', value: demo.balance.expenses, primary: false },
]
</script>

<template>
  <dl class="grid gap-3 md:grid-cols-3 md:gap-6">
    <div
      v-for="summary in summaries"
      :key="summary.label"
      class="min-w-0 rounded-xl p-5 md:p-6"
      :class="summary.primary ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'"
    >
      <dt :class="summary.primary ? 'text-white' : 'text-gray-500'">{{ summary.label }}</dt>
      <dd class="mt-3 text-preset-1">{{ currency.format(summary.value) }}</dd>
    </div>
  </dl>
</template>
