<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { defineChart, type ChartPoint } from '@tanstack/charts'
import { pie, polar, radialArc, type PieDatum } from '@tanstack/charts/polar'
import { decorative } from '@tanstack/charts/mark/decorative'
import { Chart } from '@tanstack/charts/vue'
import { formatCurrency } from '@/utils/currency'

interface BudgetChartCategory {
  category: string
  maximum: number
  theme: string
  spent: number
}

const { categories, reportingPeriod } = defineProps<{
  categories: readonly BudgetChartCategory[]
  reportingPeriod: string
}>()

const totalSpent = computed(
  () => categories.reduce((total, category) => total + Math.round(category.spent * 100), 0) / 100,
)
const totalLimit = computed(
  () => categories.reduce((total, category) => total + Math.round(category.maximum * 100), 0) / 100,
)
const chartLabel = computed(
  () =>
    `${reportingPeriod} budget spending: ${formatCurrency(totalSpent.value, 0)} spent of ${formatCurrency(totalLimit.value, 0)} limit.`,
)
const slices = computed(() => pie(categories, { value: 'maximum' }))
const hoveredCategoryName = shallowRef<string | null>(null)
const hoveredCategory = computed(() =>
  categories.find((category) => category.category === hoveredCategoryName.value),
)
const centerSpent = computed(() => hoveredCategory.value?.spent ?? totalSpent.value)
const centerLimit = computed(() => hoveredCategory.value?.maximum ?? totalLimit.value)

function showCategorySpending(point: ChartPoint<PieDatum<BudgetChartCategory>> | null) {
  hoveredCategoryName.value = point?.datum.category ?? null
}

const definition = computed(() =>
  defineChart(
    {
      margin: 0,
      marks: [
        polar({
          scales: { angle: null, radius: null },
          marks: [
            radialArc(slices.value, {
              key: 'category',
              color: 'category',
              innerRadius: ({ radius }) => radius * 0.675,
            }),
          ],
        }),
        decorative(
          polar({
            scales: { angle: null, radius: null },
            marks: [
              radialArc(slices.value, {
                key: 'category',
                fill: 'white',
                fillOpacity: 0.25,
                innerRadius: ({ radius }) => radius * 0.675,
                outerRadius: ({ radius }) => radius * 0.78,
              }),
            ],
          }),
        ),
      ],
      scales: { x: null, y: null },
      color: {
        domain: categories.map((category) => category.category),
        range: categories.map((category) => category.theme),
      },
    },
    {
      pointer: true,
      keyboard: false,
      focus: 'nearest',
      maxFocusDistance: 0,
      focusRing: { fill: 'var(--color-gray-900)', strokeWidth: 0 },
      motion: false,
    },
  ),
)
</script>

<template>
  <div class="relative mx-auto aspect-square w-full max-w-60 min-w-0">
    <div
      v-if="!categories.length"
      role="img"
      :aria-label="chartLabel"
      class="absolute inset-0 rounded-full border-[39px] border-gray-100"
    />
    <Chart
      v-else
      :definition="definition"
      :aria-label="chartLabel"
      :aspect-ratio="1"
      :initial-width="240"
      :on-focus-change="showCategorySpending"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2"
    >
      <p class="text-preset-1">{{ formatCurrency(centerSpent, 0) }}</p>
      <p class="text-preset-5 text-gray-500">of {{ formatCurrency(centerLimit, 0) }} limit</p>
    </div>
  </div>
</template>
