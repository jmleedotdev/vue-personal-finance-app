<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { RouterLink } from 'vue-router'
import IconEllipsis from '@/components/icons/IconEllipsis.vue'
import IconCaretRight from '@/components/icons/IconCaretRight.vue'
import { formatCurrency } from '@/utils/currency'
import { formatCalendarDate } from '@/utils/formatting'
import type { BudgetSpending } from '@/stores/budgets'

const { budget } = defineProps<{ budget: BudgetSpending }>()
const emit = defineEmits<{ edit: [id: string] }>()
const menuOpen = ref(false)
const menuRoot = useTemplateRef('menuRoot')
const trigger = useTemplateRef('trigger')
const editAction = useTemplateRef('editAction')

async function openMenu() {
  menuOpen.value = true
  await nextTick()
  editAction.value?.focus()
}
function closeMenu(restoreFocus = false) {
  menuOpen.value = false
  if (restoreFocus) trigger.value?.focus()
}
function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    closeMenu(true)
  } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault()
    void openMenu()
  } else if (event.key === 'Tab') closeMenu()
}
function onOutsidePointer(event: PointerEvent) {
  if (event.target instanceof Node && !menuRoot.value?.contains(event.target)) closeMenu()
}
function onFocusout(event: FocusEvent) {
  if (!(event.relatedTarget instanceof Node && menuRoot.value?.contains(event.relatedTarget)))
    closeMenu()
}
async function editBudget() {
  closeMenu(true)
  await nextTick()
  emit('edit', budget.id)
}
onMounted(() => document.addEventListener('pointerdown', onOutsidePointer))
onUnmounted(() => document.removeEventListener('pointerdown', onOutsidePointer))

const avatarAssets = import.meta.glob<string>('@/assets/images/avatars/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})
</script>

<template>
  <article
    :aria-labelledby="`${budget.id}-heading`"
    class="min-w-0 rounded-xl bg-white px-5 py-6 md:p-8"
  >
    <header class="flex items-center justify-between gap-4">
      <h2 :id="`${budget.id}-heading`" class="flex min-w-0 items-center gap-4 text-preset-2">
        <span
          aria-hidden="true"
          class="size-4 shrink-0 rounded-full"
          :style="{ backgroundColor: budget.theme }"
        />
        <span class="min-w-0 wrap-break-word">{{ budget.category }}</span>
      </h2>
      <div ref="menuRoot" class="relative shrink-0" @keydown="onMenuKeydown" @focusout="onFocusout">
        <button
          :id="`${budget.id}-menu-trigger`"
          ref="trigger"
          type="button"
          :aria-label="`Manage ${budget.category} budget`"
          aria-haspopup="menu"
          :aria-expanded="menuOpen"
          :aria-controls="menuOpen ? `${budget.id}-menu` : undefined"
          class="flex size-8 items-center justify-center rounded-sm text-gray-500 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          @click="menuOpen ? closeMenu() : openMenu()"
        >
          <IconEllipsis />
        </button>
        <div
          v-if="menuOpen"
          :id="`${budget.id}-menu`"
          role="menu"
          :aria-labelledby="`${budget.id}-menu-trigger`"
          class="absolute top-full right-0 z-10 mt-2 w-max rounded-lg bg-white px-5 py-3 shadow-[0_4px_24px_0_#00000040]"
        >
          <button
            ref="editAction"
            type="button"
            role="menuitem"
            class="rounded-sm py-1 text-preset-4 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            @click="editBudget"
          >
            Edit Budget
          </button>
        </div>
      </div>
    </header>
    <dl class="mt-5">
      <div class="flex flex-wrap gap-1 text-gray-500">
        <dt>Maximum Spend</dt>
        <dd>{{ formatCurrency(budget.maximum) }}</dd>
      </div>
    </dl>
    <div
      role="progressbar"
      :aria-label="`${budget.category} spending`"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="budget.progress"
      :aria-valuetext="`${formatCurrency(budget.spent)} spent of ${formatCurrency(budget.maximum)}`"
      class="mt-4 h-8 rounded-sm bg-beige-100 p-1"
    >
      <div
        class="h-full rounded-sm"
        :style="{ width: `${budget.progress}%`, backgroundColor: budget.theme }"
      />
    </div>
    <dl class="mt-4 grid min-w-0 grid-cols-2 gap-4">
      <div class="min-w-0 rounded-xs border-l-4 pl-4" :style="{ borderColor: budget.theme }">
        <dt class="text-preset-5 text-gray-500">Spent</dt>
        <dd class="mt-1 text-preset-4 font-bold wrap-break-word">
          {{ formatCurrency(budget.spent) }}
        </dd>
      </div>
      <div class="min-w-0 rounded-xs border-l-4 border-beige-100 pl-4">
        <dt class="text-preset-5 text-gray-500">Remaining</dt>
        <dd class="mt-1 text-preset-4 font-bold wrap-break-word">
          {{ formatCurrency(budget.remaining) }}
        </dd>
      </div>
    </dl>
    <section
      :aria-labelledby="`${budget.id}-latest`"
      class="mt-5 rounded-xl bg-beige-100 p-4 md:p-5"
    >
      <header class="mb-5 flex items-center justify-between gap-3">
        <h3 :id="`${budget.id}-latest`" class="text-preset-3">Latest Spending</h3>
        <RouterLink
          :to="{ path: '/transactions', query: { category: budget.category } }"
          :aria-label="`See All ${budget.category} transactions`"
          class="inline-flex shrink-0 items-center gap-3 rounded-lg text-preset-4 text-gray-500 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-900"
          >See All <IconCaretRight
        /></RouterLink>
      </header>
      <ul v-if="budget.latestSpending.length" class="divide-y divide-gray-900/15">
        <li
          v-for="transaction in budget.latestSpending"
          :key="transaction.index"
          class="flex min-w-0 items-center gap-4 py-3 first:pt-0 last:pb-0"
        >
          <img
            :src="avatarAssets[transaction.avatar]"
            alt=""
            class="hidden size-8 shrink-0 rounded-full object-cover md:block"
          />
          <p class="min-w-0 flex-1 text-preset-5 font-bold wrap-break-word">
            {{ transaction.name }}
          </p>
          <div class="shrink-0 text-right text-preset-5">
            <p class="font-bold">{{ formatCurrency(transaction.amount) }}</p>
            <time :datetime="transaction.calendarDate" class="mt-2 block text-gray-500">{{
              formatCalendarDate(transaction.date)
            }}</time>
          </div>
        </li>
      </ul>
      <p v-else class="text-gray-500">No spending yet</p>
    </section>
  </article>
</template>
