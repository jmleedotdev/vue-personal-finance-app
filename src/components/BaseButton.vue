<script setup lang="ts">
import caretRight from '@/assets/icons/caret-right.svg'

const {
  variant = 'primary',
  type = 'button',
  disabled = false,
  trailingCaret = false,
} = defineProps<{
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destroy'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  trailingCaret?: boolean
}>()

const variants = {
  primary: 'bg-gray-900 text-white enabled:hover:bg-gray-500',
  secondary:
    'bg-beige-100 text-gray-900 enabled:hover:bg-white enabled:hover:inset-ring enabled:hover:inset-ring-beige-500',
  tertiary: 'gap-3 text-gray-500 font-normal enabled:hover:text-gray-900',
  destroy: 'bg-red text-white enabled:hover:bg-red-hover',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-lg text-preset-4 transition-colors duration-150 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
    :class="[variants[variant], variant === 'tertiary' ? '' : 'gap-4 p-4 font-bold']"
  >
    <slot />
    <img v-if="trailingCaret" :src="caretRight" alt="" />
  </button>
</template>
