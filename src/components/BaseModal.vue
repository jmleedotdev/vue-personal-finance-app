<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, useId, useTemplateRef } from 'vue'
import closeModal from '@/assets/icons/close-modal.svg'

const { heading, description, returnFocus } = defineProps<{
  heading: string
  description: string
  returnFocus?: () => HTMLElement | null
}>()
const emit = defineEmits<{ close: [] }>()
const id = useId()
const overlay = useTemplateRef('overlay')
const panel = useTemplateRef('panel')
const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
const isolated: { element: HTMLElement; inert: boolean; hidden: string | null }[] = []
const previousOverflow = document.body.style.overflow
const previousRootOverflow = document.documentElement.style.overflow

function controls() {
  return Array.from(
    panel.value?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
    ) ?? [],
  ).filter((element) => !element.closest('[inert], [hidden]'))
}

function containFocus(event: FocusEvent) {
  if (event.target instanceof Node && !panel.value?.contains(event.target)) {
    controls()[0]?.focus()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented) return
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
  } else if (event.key === 'Tab') {
    const items = controls()
    const first = items[0]
    const last = items[items.length - 1]
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === panel.value)
    ) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }
}

onMounted(() => {
  // Isolate siblings at each ancestor, without hiding the dialog's own ancestors.
  let branch: HTMLElement | null = overlay.value
  while (branch?.parentElement) {
    for (const sibling of branch.parentElement.children) {
      if (sibling === branch || !(sibling instanceof HTMLElement)) continue
      isolated.push({
        element: sibling,
        inert: sibling.inert,
        hidden: sibling.getAttribute('aria-hidden'),
      })
      sibling.inert = true
      sibling.setAttribute('aria-hidden', 'true')
    }
    branch = branch.parentElement
    if (branch === document.body) break
  }
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  // Start at the first field, leaving Close available immediately with Shift+Tab.
  const initial =
    panel.value?.querySelector<HTMLElement>('[role="combobox"], input') ??
    controls()[0] ??
    panel.value
  initial?.focus()
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('focusin', containFocus)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('focusin', containFocus)
  for (const { element, inert, hidden } of isolated) {
    element.inert = inert
    if (hidden === null) element.removeAttribute('aria-hidden')
    else element.setAttribute('aria-hidden', hidden)
  }
  document.body.style.overflow = previousOverflow
  document.documentElement.style.overflow = previousRootOverflow
  void nextTick(() => {
    const target =
      opener?.isConnected && !opener.matches(':disabled') && !opener.closest('[inert]')
        ? opener
        : returnFocus?.()
    target?.focus({ preventScroll: target === opener })
  })
})
</script>

<template>
  <div
    ref="overlay"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-5"
    @click.self="emit('close')"
  >
    <section
      ref="panel"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`${id}-heading`"
      :aria-describedby="`${id}-description`"
      tabindex="-1"
      class="flex max-h-[calc(100dvh-40px)] w-full max-w-[560px] min-w-0 flex-col gap-5 overflow-y-auto overscroll-contain rounded-xl bg-white px-5 py-6 md:p-8"
    >
      <header class="flex items-center justify-between gap-4">
        <h2 :id="`${id}-heading`" class="text-preset-2 md:text-preset-1">{{ heading }}</h2>
        <button
          type="button"
          aria-label="Close dialog"
          class="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-beige-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          @click="emit('close')"
        >
          <img :src="closeModal" alt="" />
        </button>
      </header>
      <p :id="`${id}-description`" class="text-gray-500">{{ description }}</p>
      <slot />
    </section>
  </div>
</template>
