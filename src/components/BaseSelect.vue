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
  inline = false,
  active = false,
} = defineProps<{
  label: string
  options: readonly {
    value: string
    label: string
    swatch?: string
    disabled?: boolean
    disabledText?: string
  }[]
  placeholder?: string
  disabled?: boolean
  help?: string
  error?: string
  inline?: boolean
  active?: boolean
}>()
const model = defineModel<string>({ default: '' })
const id = useId()
const describedBy = computed(
  () =>
    [inline ? `${id}-value` : '', help ? `${id}-help` : '', error ? `${id}-error` : '']
      .filter(Boolean)
      .join(' ') || undefined,
)
const open = ref(false)
const trigger = useTemplateRef('trigger')
const root = useTemplateRef('root')
const activeIndex = ref(-1)
const popupStyle = ref<Record<string, string>>({})

function positionPopup() {
  if (!root.value?.closest('[role="dialog"]') || !trigger.value) return
  const bounds = trigger.value.getBoundingClientRect()
  const below = window.innerHeight - bounds.bottom - 36
  const above = bounds.top - 36
  const upwards = below < Math.min(288, options.length * 46 + 24) && above > below
  popupStyle.value = {
    position: 'fixed',
    left: `${bounds.left}px`,
    width: `${bounds.width}px`,
    top: upwards ? 'auto' : `${bounds.bottom + 16}px`,
    bottom: upwards ? `${window.innerHeight - bounds.top + 16}px` : 'auto',
    marginTop: '0',
    maxHeight: `${Math.max(0, Math.min(288, upwards ? above : below))}px`,
  }
}
let search = ''
let lastTypedAt = 0
const unavailable = computed(() => disabled || !options.some((option) => !option.disabled))
const selected = computed(() => options.find((option) => option.value === model.value))
const activeId = computed(() =>
  open.value && options[activeIndex.value] ? `${id}-option-${activeIndex.value}` : undefined,
)

function show() {
  if (unavailable.value) return
  const selectedIndex = options.findIndex(
    (option) => option.value === model.value && !option.disabled,
  )
  activeIndex.value =
    selectedIndex >= 0 ? selectedIndex : options.findIndex((option) => !option.disabled)
  search = ''
  positionPopup()
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
    if (!options[index]?.disabled && options[index]?.label.toLocaleLowerCase().startsWith(prefix)) {
      activeIndex.value = index
      return
    }
  }
}

function move(start: number, direction: number) {
  for (let index = start; index >= 0 && index < options.length; index += direction) {
    if (!options[index]?.disabled) {
      activeIndex.value = index
      return
    }
  }
}

function onKeydown(event: KeyboardEvent) {
  if (unavailable.value) return
  if (event.key === 'Escape') {
    if (open.value) {
      event.preventDefault()
      event.stopPropagation()
      open.value = false
    }
  } else if (event.key === 'Tab') {
    if (open.value) select(activeIndex.value, false)
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    if (!open.value) show()
    move(event.key === 'Home' ? 0 : options.length - 1, event.key === 'Home' ? 1 : -1)
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) show()
    else {
      const direction = event.key === 'ArrowDown' ? 1 : -1
      move(activeIndex.value + direction, direction)
    }
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

function onGeometryChange() {
  if (open.value) positionPopup()
}

onMounted(() => {
  document.addEventListener('pointerdown', onOutsidePointer)
  document.addEventListener('scroll', onGeometryChange, true)
  window.addEventListener('resize', onGeometryChange)
})
onUnmounted(() => {
  document.removeEventListener('pointerdown', onOutsidePointer)
  document.removeEventListener('scroll', onGeometryChange, true)
  window.removeEventListener('resize', onGeometryChange)
})

watch(
  () => options.map((option) => ({ value: option.value, disabled: option.disabled })),
  (values, previous) => {
    if (!open.value) return
    const previousValue = previous[activeIndex.value]?.value
    const retainedIndex = values.findIndex(
      (option) => option.value === previousValue && !option.disabled,
    )
    const selectedIndex = values.findIndex(
      (option) => option.value === model.value && !option.disabled,
    )
    activeIndex.value =
      retainedIndex >= 0
        ? retainedIndex
        : selectedIndex >= 0
          ? selectedIndex
          : values.findIndex((option) => !option.disabled)
  },
)

watch(unavailable, (value) => {
  if (value) open.value = false
})

watch(activeId, async (optionId) => {
  await nextTick()
  if (!optionId) return
  const option = document.getElementById(optionId)
  const list = option?.parentElement
  if (!option || !list) return
  // Reveal the active option within the menu without scrolling the page.
  const optionBounds = option.getBoundingClientRect()
  const listBounds = list.getBoundingClientRect()
  if (optionBounds.top < listBounds.top)
    list.scrollTop -= Math.ceil(listBounds.top - optionBounds.top)
  else if (optionBounds.bottom > listBounds.bottom) {
    list.scrollTop += Math.ceil(optionBounds.bottom - listBounds.bottom)
  }
})

function select(index: number, restoreFocus = true) {
  const option = options[index]
  if (option?.disabled || unavailable.value) return
  if (option && option.value !== model.value) model.value = option.value
  open.value = false
  if (restoreFocus) trigger.value?.focus({ preventScroll: true })
}
</script>

<template>
  <div
    ref="root"
    :class="inline ? 'flex shrink-0 items-center gap-2' : 'flex flex-col gap-1'"
    @focusout="onFocusout"
  >
    <label
      :id="`${id}-label`"
      :for="id"
      :class="
        inline
          ? 'sr-only text-preset-4 whitespace-nowrap text-gray-500 md:not-sr-only'
          : 'text-preset-5 font-bold text-gray-500'
      "
      >{{ label }}</label
    >
    <div class="relative">
      <button
        v-bind="$attrs"
        :id="id"
        ref="trigger"
        type="button"
        :disabled="unavailable"
        role="combobox"
        aria-haspopup="listbox"
        :aria-labelledby="$attrs['aria-label'] ? undefined : `${id}-label`"
        :data-active="active || undefined"
        :aria-expanded="open"
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-controls="open ? `${id}-listbox` : undefined"
        :aria-activedescendant="activeId"
        class="flex min-h-[45px] w-full items-center justify-between gap-4 rounded-lg bg-white text-left text-preset-4 text-gray-900 focus:border-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 enabled:not-focus:not-aria-invalid:hover:border-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 aria-invalid:border-red"
        :class="
          inline
            ? 'justify-center px-1 data-[active=true]:bg-beige-100 data-[active=true]:text-green md:justify-between md:border md:border-beige-500 md:px-5 md:py-[11px] md:data-[active=true]:bg-white md:data-[active=true]:text-gray-900'
            : 'border border-beige-500 px-5 py-[11px]'
        "
        @click="toggle"
        @keydown="onKeydown"
      >
        <span v-if="inline" class="flex size-6 items-center justify-center md:hidden"
          ><slot name="icon"
        /></span>
        <span
          :id="`${id}-value`"
          :class="[
            selected ? '' : 'text-beige-500',
            inline ? 'sr-only whitespace-nowrap md:not-sr-only' : '',
          ]"
          class="flex min-w-0 items-center gap-3"
          ><span
            v-if="selected?.swatch"
            aria-hidden="true"
            class="size-4 shrink-0 rounded-full"
            :style="{ backgroundColor: selected.swatch }"
          />{{ selected?.label ?? placeholder }}</span
        >
        <span
          :class="inline ? 'hidden md:flex' : 'flex'"
          class="size-4 shrink-0 items-center justify-center"
          ><img :src="caretDown" alt=""
        /></span>
      </button>
      <ul
        v-if="open"
        :id="`${id}-listbox`"
        role="listbox"
        :style="popupStyle"
        :aria-labelledby="`${id}-label`"
        class="absolute top-full z-10 mt-4 max-h-[min(288px,40dvh)] overflow-y-auto overscroll-contain rounded-lg bg-white px-5 py-3 shadow-[0_4px_24px_0_#00000040]"
        :class="inline ? 'right-0 w-max max-w-[calc(100vw-4.5rem)] min-w-full' : 'w-full'"
      >
        <li
          v-for="(option, index) in options"
          :key="option.value"
          :id="`${id}-option-${index}`"
          role="option"
          :aria-selected="option.value === model"
          :aria-disabled="!!option.disabled"
          class="flex items-center gap-3 border-b border-gray-100 py-3 text-preset-4 last:border-0"
          :class="[
            option.value === model ? 'font-bold' : '',
            index === activeIndex ? 'bg-beige-100' : '',
            option.disabled
              ? 'cursor-not-allowed text-gray-500'
              : 'cursor-pointer text-gray-900 hover:bg-beige-100',
          ]"
          @mousedown.prevent
          @click="select(index)"
        >
          <span
            v-if="option.swatch"
            aria-hidden="true"
            class="size-4 shrink-0 rounded-full"
            :class="option.disabled ? 'opacity-25' : ''"
            :style="{ backgroundColor: option.swatch }"
          />
          <span class="min-w-0 flex-1">{{ option.label }}</span
          ><span v-if="option.disabledText" class="shrink-0 text-preset-5 text-gray-500">{{
            option.disabledText
          }}</span>
        </li>
      </ul>
    </div>
    <p v-if="help" :id="`${id}-help`" class="text-right text-preset-5 text-gray-500">{{ help }}</p>
    <p v-if="error" :id="`${id}-error`" class="text-right text-preset-5 text-red">{{ error }}</p>
  </div>
</template>
