<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import type { Pot } from '@/stores/pots'
import { formatCurrency } from '@/utils/currency'

const { pot, preview, confirm } = defineProps<{
  pot: Pot
  preview: (input: string) => { error: string; total?: number }
  confirm: (input: string) => boolean
}>()
const emit = defineEmits<{ complete: [] }>()
const amount = ref('')
const error = ref('')
const committed = ref(false)
const projection = computed(() => preview(amount.value))
const total = computed(() => projection.value.total ?? pot.total)
const percentage = computed(() => (total.value / pot.target) * 100)
const percentageText = computed(() => `${Number(percentage.value.toFixed(2))}%`)
const existingWidth = computed(() => Math.min(100, (pot.total / pot.target) * 100))
const additionWidth = computed(() =>
  Math.max(0, Math.min(100, percentage.value) - existingWidth.value),
)
function submit(event: Event) {
  if (committed.value) return
  error.value = preview(amount.value).error
  if (!error.value && confirm(amount.value)) {
    committed.value = true
    emit('complete')
    return
  }
  error.value ||= 'The available funds changed. Please check your amount and try again.'
  const form = event.currentTarget as HTMLFormElement
  void nextTick(() => form.querySelector('input')?.focus())
}
</script>

<template>
  <form class="flex min-w-0 flex-col gap-5" novalidate @submit.prevent="submit">
    <div class="my-5 flex min-w-0 flex-col gap-4">
      <dl class="flex flex-wrap items-center justify-between gap-2">
        <dt class="text-gray-500">New Amount</dt>
        <dd class="text-preset-1 wrap-anywhere">{{ formatCurrency(total) }}</dd>
      </dl>
      <div>
        <div
          role="progressbar"
          :aria-label="`${pot.name} projected savings`"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.min(100, percentage)"
          :aria-valuetext="`${percentageText} saved toward target of ${formatCurrency(pot.target)}`"
          class="flex h-2 overflow-hidden rounded-sm bg-beige-100"
        >
          <span
            aria-hidden="true"
            class="h-full shrink-0 bg-gray-900"
            :style="{ width: `${existingWidth}%` }"
          />
          <span
            aria-hidden="true"
            class="h-full shrink-0 rounded-r-sm bg-green"
            :class="{
              'shadow-[inset_2px_0_0_var(--color-white)]': existingWidth > 0 && additionWidth > 0,
            }"
            :style="{ width: `${additionWidth}%` }"
          />
        </div>
        <div class="mt-[13px] flex justify-between gap-2 text-preset-5">
          <p class="font-bold text-green">{{ percentageText }}</p>
          <p class="text-right text-gray-500">Target of {{ formatCurrency(pot.target) }}</p>
        </div>
      </div>
    </div>
    <BaseInput
      v-model="amount"
      label="Amount to Add"
      inputmode="decimal"
      placeholder="e.g. 100"
      :error="error"
    >
      <template #leading><span aria-hidden="true" class="text-beige-500">$</span></template>
    </BaseInput>
    <BaseButton type="submit" :disabled="committed" class="w-full">Confirm Addition</BaseButton>
  </form>
</template>
