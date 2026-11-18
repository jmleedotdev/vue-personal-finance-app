<script setup lang="ts">
import { nextTick, ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import type { BudgetInput } from '@/stores/budgets'
import { formatCurrency } from '@/utils/currency'

const { categories, themes, initialBudget } = defineProps<{
  initialBudget?: BudgetInput
  categories: readonly { label: string; value: string }[]
  themes: readonly { label: string; value: string; swatch: string; disabled: boolean }[]
}>()
const emit = defineEmits<{
  submit: [budget: BudgetInput]
}>()
const category = ref(initialBudget?.category ?? categories[0]?.value ?? '')
const maximum = ref(initialBudget ? initialBudget.maximum.toFixed(2) : '')
const theme = ref(
  initialBudget?.theme.toUpperCase() ?? themes.find((option) => !option.disabled)?.value ?? '',
)
const amountError = ref('')
const categoryError = ref('')
const themeError = ref('')

function submit(event: Event) {
  amountError.value = ''
  categoryError.value = categories.some((option) => option.value === category.value)
    ? ''
    : 'Choose an available category.'
  themeError.value = themes.some((option) => option.value === theme.value && !option.disabled)
    ? ''
    : 'Choose an unused theme.'
  const value = maximum.value.trim()
  let cents = 0n
  if (/^(?:\d+(\.\d{0,2})?|\.\d{1,2})$/.test(value)) {
    const [dollars = '0', fraction = ''] = value.split('.')
    cents = BigInt(dollars) * 100n + BigInt(fraction.padEnd(2, '0'))
  }
  const amount = Number(cents) / 100
  if (
    cents <= 0n ||
    cents > BigInt(Number.MAX_SAFE_INTEGER) ||
    Math.round(amount * 100) !== Number(cents) ||
    // Intl formats the shortest decimal dollar representation, which can lose a cent
    // near the safe-integer boundary even when multiplying back appears to round-trip.
    BigInt(formatCurrency(amount).replace(/\D/g, '')) !== cents
  ) {
    amountError.value = 'Enter an amount above $0 with up to 2 decimal places.'
  }
  if (amountError.value || categoryError.value || themeError.value) {
    const form = event.currentTarget as HTMLFormElement
    void nextTick(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
    return
  }
  emit('submit', { category: category.value, maximum: amount, theme: theme.value })
}
</script>

<template>
  <form class="flex min-w-0 flex-col gap-4" novalidate @submit.prevent="submit">
    <BaseSelect
      v-model="category"
      label="Budget Category"
      :options="categories"
      :error="categoryError"
    />
    <BaseInput
      v-model="maximum"
      label="Maximum Spend"
      :error="amountError"
      inputmode="decimal"
      placeholder="e.g. 2000"
    >
      <template #leading><span aria-hidden="true" class="text-beige-500">$</span></template>
    </BaseInput>
    <BaseSelect v-model="theme" label="Theme" :options="themes" :error="themeError" />
    <BaseButton type="submit" class="mt-1 w-full">{{
      initialBudget ? 'Save Changes' : 'Add Budget'
    }}</BaseButton>
  </form>
</template>
