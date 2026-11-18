<script setup lang="ts">
import { nextTick, ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import type { PotInput } from '@/stores/pots'
import { parsePositiveUsd } from '@/utils/currency'

const { themes, initialPot, names } = defineProps<{
  initialPot?: PotInput
  names: readonly string[]
  themes: readonly { label: string; value: string; swatch: string; disabled: boolean }[]
}>()
const emit = defineEmits<{ submit: [pot: PotInput] }>()
const name = ref(initialPot?.name ?? '')
const target = ref(initialPot ? initialPot.target.toFixed(2) : '')
const theme = ref(initialPot?.theme ?? themes.find((option) => !option.disabled)?.value ?? '')
const nameError = ref('')
const targetError = ref('')
const themeError = ref('')
function submit(event: Event) {
  const trimmed = name.value.trim()
  nameError.value =
    !trimmed || trimmed.length > 30
      ? 'Enter a name between 1 and 30 characters.'
      : names.some((existing) => existing.trim().toLowerCase() === trimmed.toLowerCase())
        ? 'A pot with this name already exists.'
        : ''
  const amount = parsePositiveUsd(target.value)
  targetError.value = amount === null ? 'Enter an amount above $0 with up to 2 decimal places.' : ''
  themeError.value = themes.some((option) => option.value === theme.value && !option.disabled)
    ? ''
    : 'Choose an unused theme.'
  if (nameError.value || targetError.value || themeError.value || amount === null) {
    const form = event.currentTarget as HTMLFormElement
    void nextTick(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
    return
  }
  emit('submit', { name: trimmed, target: amount, theme: theme.value })
}
</script>

<template>
  <form class="flex min-w-0 flex-col gap-4" novalidate @submit.prevent="submit">
    <BaseInput
      v-model="name"
      label="Pot Name"
      :error="nameError"
      placeholder="e.g. Rainy Days"
      :help="`${Math.max(0, 30 - name.length)} characters left`"
    />
    <BaseInput
      v-model="target"
      label="Target"
      :error="targetError"
      inputmode="decimal"
      placeholder="e.g. 2000"
    >
      <template #leading><span aria-hidden="true" class="text-beige-500">$</span></template>
    </BaseInput>
    <BaseSelect v-model="theme" label="Theme" :options="themes" :error="themeError" />
    <BaseButton type="submit" class="mt-1 w-full">{{
      initialPot ? 'Save Changes' : 'Add Pot'
    }}</BaseButton>
  </form>
</template>
