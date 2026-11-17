<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useId, useTemplateRef, watch } from 'vue'
import caretDown from '@/assets/icons/caret-down.svg'

defineOptions({ inheritAttrs: false })

const {
  label,
  options,
  placeholder = '',
  disabled = false,
  help = '',
  error = '',
} = defineProps<{
  label: string
  options: readonly { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
  help?: string
  error?: string
}>()
const model = defineModel<string>({ default: '' })
const id = useId()
const describedBy = computed(
  () =>
    [help ? `${id}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined,
)
const open = ref(false)
const trigger = useTemplateRef('trigger')
const root = useTemplateRef('root')
const activeIndex = ref(-1)
let search = ''
let lastTypedAt = 0
const unavailable = computed(() => disabled || options.length === 0)
const selected = computed(() => options.find((option) => option.value === model.value))
const activeId = computed(() =>
  open.value && options[activeIndex.value] ? `${id}-option-${activeIndex.value}` : undefined,
)

function show() {
  if (unavailable.value) return
  activeIndex.value = Math.max(
    0,
    options.findIndex((option) => option.value === model.value),
  )
  search = ''
  open.value = true
}

function toggle() {
  if (open.value) open.value = false
  else show()
}

function findByLabel(character: string) {
  if (!open.value) show()
  const now = Date.now()
  search = now - lastTypedAt > 700 ? character : search + character
  lastTypedAt = now
  const prefix = [...search].every((letter) => letter === search[0]) ? character : search
  const start = prefix.length === 1 ? activeIndex.value + 1 : activeIndex.value
  for (let offset = 0; offset < options.length; offset++) {
    const index = (start + offset) % options.length
    if (options[index]?.label.toLocaleLowerCase().startsWith(prefix)) {
      activeIndex.value = index
      return
    }
  }
}

function onKeydown(event: KeyboardEvent) {
  if (unavailable.value) return
  if (event.key === 'Escape') {
    if (open.value) event.preventDefault()
    open.value = false
  } else if (event.key === 'Tab') {
    if (open.value) select(activeIndex.value, false)
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    if (!open.value) show()
    activeIndex.value = event.key === 'Home' ? 0 : options.length - 1
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) show()
    else
      activeIndex.value = Math.max(
        0,
        Math.min(options.length - 1, activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1)),
      )
  } else if (event.key === ' ' && open.value && search && Date.now() - lastTypedAt <= 700) {
    event.preventDefault()
    findByLabel(' ')
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (open.value) select(activeIndex.value)
    else show()
  } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault()
    findByLabel(event.key.toLocaleLowerCase())
  }
}

function onOutsidePointer(event: PointerEvent) {
  if (open.value && event.target instanceof Node && !root.value?.contains(event.target)) {
    select(activeIndex.value, false)
  }
}

function onFocusout(event: FocusEvent) {
  if (
    open.value &&
    !(event.relatedTarget instanceof Node && root.value?.contains(event.relatedTarget))
  ) {
    select(activeIndex.value, false)
  }
}

onMounted(() => document.addEventListener('pointerdown', onOutsidePointer))
onUnmounted(() => document.removeEventListener('pointerdown', onOutsidePointer))

watch(
  () => options.map((option) => option.value),
  (values, previous) => {
    if (!open.value) return
    const previousValue = previous[activeIndex.value]
    const retainedIndex = previousValue === undefined ? -1 : values.indexOf(previousValue)
    activeIndex.value =
      retainedIndex >= 0 ? retainedIndex : Math.max(0, values.indexOf(model.value))
  },
)

watch(unavailable, (value) => {
  if (value) open.value = false
})

watch(activeId, async (optionId) => {
  await nextTick()
  if (optionId) document.getElementById(optionId)?.scrollIntoView?.({ block: 'nearest' })
})

function select(index: number, restoreFocus = true) {
  const option = options[index]
  if (option && !unavailable.value && option.value !== model.value) model.value = option.value
  open.value = false
  if (restoreFocus) trigger.value?.focus()
}
</script>

<template>
  <div ref="root" class="flex flex-col gap-1" @focusout="onFocusout">
    <label :id="`${id}-label`" :for="id" class="text-preset-5 font-bold text-gray-500">{{
      label
    }}</label>
    <div class="relative">
      <button
        v-bind="$attrs"
        :id="id"
        ref="trigger"
        type="button"
        :disabled="unavailable"
        role="combobox"
        aria-haspopup="listbox"
        :aria-labelledby="`${id}-label`"
        :aria-expanded="open"
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-controls="open ? `${id}-listbox` : undefined"
        :aria-activedescendant="activeId"
        class="flex min-h-[45px] w-full items-center justify-between gap-4 rounded-lg border border-beige-500 bg-white px-5 py-[11px] text-left text-preset-4 text-gray-900 focus:border-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 enabled:not-focus:not-aria-invalid:hover:border-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 aria-invalid:border-red"
        @click="toggle"
        @keydown="onKeydown"
      >
        <span :class="selected ? '' : 'text-beige-500'">{{ selected?.label ?? placeholder }}</span>
        <span class="flex size-4 shrink-0 items-center justify-center"
          ><img :src="caretDown" alt=""
        /></span>
      </button>
      <ul
        v-if="open"
        :id="`${id}-listbox`"
        role="listbox"
        :aria-labelledby="`${id}-label`"
        class="absolute top-full z-10 mt-4 max-h-72 w-full overflow-y-auto rounded-lg bg-white px-5 py-3 shadow-[0_4px_24px_0_#00000040]"
      >
        <li
          v-for="(option, index) in options"
          :key="option.value"
          :id="`${id}-option-${index}`"
          role="option"
          :aria-selected="option.value === model"
          class="cursor-pointer border-b border-gray-100 py-3 text-preset-4 text-gray-900 last:border-0 hover:bg-beige-100"
          :class="[
            option.value === model ? 'font-bold' : '',
            index === activeIndex ? 'bg-beige-100' : '',
          ]"
          @mousedown.prevent
          @click="select(index)"
        >
          {{ option.label }}
        </li>
      </ul>
    </div>
    <p v-if="help" :id="`${id}-help`" class="text-right text-preset-5 text-gray-500">{{ help }}</p>
    <p v-if="error" :id="`${id}-error`" class="text-right text-preset-5 text-red">{{ error }}</p>
  </div>
</template>
