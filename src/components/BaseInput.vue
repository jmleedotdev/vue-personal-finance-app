<script setup lang="ts">
import { computed, useId } from 'vue'

defineOptions({ inheritAttrs: false })

const {
  label,
  help = '',
  error = '',
  disabled = false,
} = defineProps<{
  label: string
  help?: string
  error?: string
  disabled?: boolean
}>()
const model = defineModel<string>({ default: '' })
const id = useId()
const describedBy = computed(
  () =>
    [help ? `${id}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined,
)
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="id" class="text-preset-5 font-bold text-gray-500">{{ label }}</label>
    <input
      v-bind="$attrs"
      :id="id"
      v-model="model"
      :disabled="disabled"
      :aria-describedby="describedBy"
      :aria-invalid="error ? true : undefined"
      class="w-full min-w-0 rounded-lg border border-beige-500 bg-white px-5 py-[11px] text-preset-4 text-gray-900 placeholder:text-beige-500 focus:border-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 enabled:not-focus:not-aria-invalid:hover:border-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 aria-invalid:border-red"
    />
    <p v-if="help" :id="`${id}-help`" class="text-right text-preset-5 text-gray-500">{{ help }}</p>
    <p v-if="error" :id="`${id}-error`" class="text-right text-preset-5 text-red">{{ error }}</p>
  </div>
</template>
