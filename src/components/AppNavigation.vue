<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
import IconMinimizeMenu from '@/components/icons/IconMinimizeMenu.vue'
import smallLogo from '@/assets/images/logo-small.svg'

import IconOverview from '@/components/icons/IconOverview.vue'
import IconTransactions from '@/components/icons/IconTransactions.vue'
import IconBudgets from '@/components/icons/IconBudgets.vue'
import IconPots from '@/components/icons/IconPots.vue'
import IconRecurringBills from '@/components/icons/IconRecurringBills.vue'
import logo from '@/assets/images/logo-large.svg'

const minimized = ref(false)
const route = useRoute()

const views = [
  { label: 'Overview', icon: IconOverview, to: '/', routeName: 'overview' },
  { label: 'Transactions', icon: IconTransactions, to: '/transactions', routeName: 'transactions' },
  { label: 'Budgets', icon: IconBudgets, to: '/budgets', routeName: 'budgets' },
  { label: 'Pots', icon: IconPots, to: '/pots', routeName: 'pots' },
  {
    label: 'Recurring Bills',
    icon: IconRecurringBills,
    to: '/recurring-bills',
    routeName: 'recurring-bills',
  },
]
</script>

<template>
  <aside
    class="fixed inset-x-0 bottom-0 z-20 rounded-t-lg bg-gray-900 px-4 pt-2 pb-[env(safe-area-inset-bottom)] md:px-10 xl:sticky xl:top-0 xl:flex xl:h-dvh xl:shrink-0 xl:flex-col xl:overflow-y-auto xl:rounded-tl-none xl:rounded-r-2xl xl:px-0 xl:pt-0 xl:pb-6"
    :class="minimized ? 'xl:w-[88px]' : 'xl:w-[300px]'"
  >
    <div class="hidden px-8 py-10 xl:block">
      <img :src="minimized ? smallLogo : logo" alt="finance" />
    </div>
    <nav
      id="main-navigation"
      aria-label="Main navigation"
      class="mx-auto w-full max-w-[800px] xl:mt-6 xl:max-w-none"
      :class="minimized ? 'xl:pr-2' : 'xl:pr-6'"
    >
      <ul class="flex justify-between xl:flex-col xl:gap-1">
        <li
          v-for="view in views"
          :key="view.label"
          class="min-w-0 flex-1 md:max-w-[104px] xl:max-w-none"
        >
          <component
            :is="view.to ? RouterLink : 'button'"
            :to="view.to"
            :type="view.to ? undefined : 'button'"
            :disabled="!view.to || undefined"
            :aria-label="view.label"
            :aria-describedby="view.to ? undefined : 'navigation-unavailable'"
            class="flex w-full flex-col items-center gap-1 rounded-t-lg border-b-4 pt-2 pb-3 font-bold transition-colors duration-150 ease-in-out focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-green disabled:cursor-not-allowed motion-reduce:transition-none md:text-preset-5 md:font-bold xl:h-14 xl:flex-row xl:gap-4 xl:rounded-tl-none xl:rounded-r-xl xl:border-b-0 xl:border-l-4 xl:px-7 xl:py-4 xl:text-preset-3"
            :class="
              view.to && view.routeName === route.name
                ? 'border-green bg-beige-100 text-gray-900'
                : view.to
                  ? 'border-transparent text-gray-300 hover:text-white'
                  : 'border-transparent text-gray-300'
            "
          >
            <span class="flex size-6 shrink-0 items-center justify-center">
              <component
                :is="view.icon"
                :class="view.to && view.routeName === route.name ? 'text-green' : undefined"
              />
            </span>
            <span class="sr-only md:not-sr-only" :class="{ 'xl:sr-only': minimized }">{{
              view.label
            }}</span>
          </component>
        </li>
      </ul>
    </nav>
    <div class="mt-auto hidden shrink-0 xl:block">
      <BaseButton
        variant="tertiary"
        class="group h-14 w-full justify-start rounded-none px-8 py-4 focus-visible:-outline-offset-4 focus-visible:outline-white enabled:hover:text-white"
        :aria-label="minimized ? 'Restore menu' : 'Minimize menu'"
        :aria-expanded="!minimized"
        aria-controls="main-navigation"
        @click="minimized = !minimized"
      >
        <span
          class="flex items-center gap-4 text-gray-300 transition-colors duration-150 ease-in-out group-hover:text-white motion-reduce:transition-none"
        >
          <span class="flex size-6 shrink-0 items-center justify-center">
            <IconMinimizeMenu :class="{ 'rotate-180': minimized }" />
          </span>
          <span v-if="!minimized" class="text-preset-3">Minimize Menu</span>
        </span>
      </BaseButton>
    </div>
    <p id="navigation-unavailable" class="sr-only">This section is not available yet.</p>
  </aside>
</template>
