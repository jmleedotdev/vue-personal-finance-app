<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import IconEllipsis from '@/components/icons/IconEllipsis.vue'
import type { Pot } from '@/stores/pots'
import { formatCurrency } from '@/utils/currency'

const { pot } = defineProps<{ pot: Pot; canAddMoney: boolean }>()
const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
  addMoney: [id: string]
  withdraw: [id: string]
}>()
const menuOpen = ref(false)
const menuRoot = useTemplateRef('menuRoot')
const trigger = useTemplateRef('trigger')
const editAction = useTemplateRef('editAction')
const deleteAction = useTemplateRef('deleteAction')
async function openMenu(focusLast = false) {
  menuOpen.value = true
  await nextTick()
  const action = focusLast ? deleteAction.value : editAction.value
  action?.focus()
  menuRoot.value?.querySelector('[role="menu"]')?.scrollIntoView?.({ block: 'nearest' })
}
function closeMenu(restoreFocus = false) {
  menuOpen.value = false
  if (restoreFocus) (trigger.value?.$el as HTMLButtonElement | undefined)?.focus()
}
function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    closeMenu(true)
  } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault()
    if (!menuOpen.value) {
      void openMenu(event.key === 'ArrowUp' || event.key === 'End')
    } else {
      const focusLast =
        event.key === 'End' || (event.key !== 'Home' && document.activeElement === editAction.value)
      const action = focusLast ? deleteAction.value : editAction.value
      action?.focus()
    }
  } else if (event.key === 'Tab') closeMenu()
}
function onOutsidePointer(event: PointerEvent) {
  if (event.target instanceof Node && !menuRoot.value?.contains(event.target)) closeMenu()
}
function onFocusout(event: FocusEvent) {
  if (!(event.relatedTarget instanceof Node && menuRoot.value?.contains(event.relatedTarget)))
    closeMenu()
}
async function requestAction(action: 'edit' | 'delete') {
  closeMenu(true)
  await nextTick()
  if (action === 'edit') emit('edit', pot.id)
  else emit('delete', pot.id)
}
onMounted(() => document.addEventListener('pointerdown', onOutsidePointer))
onUnmounted(() => document.removeEventListener('pointerdown', onOutsidePointer))
const percentage = computed(() => (pot.total / pot.target) * 100)
const percentageText = computed(() => `${Number(percentage.value.toFixed(2))}%`)
</script>

<template>
  <article
    :aria-labelledby="`${pot.id}-heading`"
    class="min-w-0 rounded-xl bg-white px-5 pt-6 pb-[38px] md:px-6 xl:pb-6"
  >
    <header class="flex items-center justify-between gap-4">
      <div class="flex min-w-0 items-center gap-4">
        <span class="size-4 shrink-0 rounded-full" :style="{ backgroundColor: pot.theme }" />
        <h2 :id="`${pot.id}-heading`" class="text-preset-2 wrap-anywhere">{{ pot.name }}</h2>
      </div>
      <div ref="menuRoot" class="relative shrink-0" @keydown="onMenuKeydown" @focusout="onFocusout">
        <BaseButton
          variant="tertiary"
          :id="`${pot.id}-menu-trigger`"
          ref="trigger"
          type="button"
          :aria-label="`Manage ${pot.name} pot`"
          aria-haspopup="menu"
          :aria-expanded="menuOpen"
          :aria-controls="menuOpen ? `${pot.id}-menu` : undefined"
          class="size-8 shrink-0"
          @click="menuOpen ? closeMenu() : openMenu()"
        >
          <IconEllipsis />
        </BaseButton>
        <div
          v-if="menuOpen"
          :id="`${pot.id}-menu`"
          role="menu"
          :aria-labelledby="`${pot.id}-menu-trigger`"
          class="absolute top-full right-0 z-10 mt-2 flex w-max flex-col divide-y divide-gray-100 rounded-lg bg-white px-5 py-1 shadow-[0_4px_24px_0] shadow-gray-900/25"
        >
          <button
            ref="editAction"
            type="button"
            role="menuitem"
            class="rounded-sm py-3 text-left text-preset-4 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            @click="requestAction('edit')"
          >
            Edit Pot
          </button>
          <button
            ref="deleteAction"
            type="button"
            role="menuitem"
            class="rounded-sm py-3 text-left text-preset-4 text-red hover:text-red-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            @click="requestAction('delete')"
          >
            Delete Pot
          </button>
        </div>
      </div>
    </header>
    <div class="my-8 flex min-h-[114px] flex-col justify-center gap-4">
      <dl class="flex flex-wrap items-center justify-between gap-2">
        <dt class="text-gray-500">Total Saved</dt>
        <dd class="text-preset-1 wrap-anywhere">{{ formatCurrency(pot.total) }}</dd>
      </dl>
      <div>
        <div
          role="progressbar"
          :aria-label="`${pot.name} savings`"
          :aria-valuenow="Math.min(100, percentage)"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuetext="`${percentageText} saved toward target of ${formatCurrency(pot.target)}`"
          class="h-2 overflow-hidden rounded-sm bg-beige-100"
        >
          <div
            class="h-full rounded-sm"
            :style="{ width: `${Math.min(100, percentage)}%`, backgroundColor: pot.theme }"
          />
        </div>
        <div class="mt-[13px] flex justify-between gap-2 text-preset-5 text-gray-500">
          <p class="font-bold">{{ percentageText }}</p>
          <p class="text-right">Target of {{ formatCurrency(pot.target) }}</p>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <BaseButton variant="secondary" :disabled="!canAddMoney" @click="emit('addMoney', pot.id)"
        >+ Add Money</BaseButton
      >
      <BaseButton variant="secondary" :disabled="pot.total === 0" @click="emit('withdraw', pot.id)"
        >Withdraw</BaseButton
      >
    </div>
  </article>
</template>
