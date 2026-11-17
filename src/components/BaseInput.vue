<script setup lang="ts">
import { computed, useId } from 'vue'

defineOptions({ inheritAttrs: false })

const {
  label,
  help = '',
  error = '',
  disabled = false,
  hideLabel = false,
} = defineProps<{
  label: string
  help?: string
  error?: string
  disabled?: boolean
  hideLabel?: boolean
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
    <label :for="id" :class="hideLabel ? 'sr-only' : 'text-preset-5 font-bold text-gray-500'">{{
      label
    }}</label>
    <div class="relative">
      <input
        v-bind="$attrs"
        :id="id"
        v-model="model"
        :disabled="disabled"
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        class="w-full min-w-0 rounded-lg border border-beige-500 bg-white px-5 py-[11px] text-preset-4 text-gray-900 placeholder:text-beige-500 focus:border-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 enabled:not-focus:not-aria-invalid:hover:border-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 aria-invalid:border-red"
        :class="$slots.trailing ? 'pr-14' : ''"
      />
      <div v-if="$slots.trailing" class="absolute inset-y-0 right-1 flex items-center">
        <slot name="trailing" />
      </div>
    </div>
    <p v-if="help" :id="`${id}-help`" class="text-right text-preset-5 text-gray-500">{{ help }}</p>
    <p v-if="error" :id="`${id}-error`" class="text-right text-preset-5 text-red">{{ error }}</p>
  </div>
</template>
