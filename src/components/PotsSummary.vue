<script setup lang="ts">
import demo from '@/data/demo.json'
import IconPot from '@/components/icons/IconPot.vue'
import BaseButton from '@/components/BaseButton.vue'
import { formatCurrency } from '@/utils/currency'

const totalSaved = demo.pots.reduce((total, pot) => total + pot.total, 0)
</script>

<template>
  <section aria-labelledby="pots-heading" class="min-w-0 rounded-xl bg-white px-5 py-6 md:p-8">
    <header class="mb-5 flex items-center justify-between gap-4">
      <h2 id="pots-heading" class="text-preset-2">Pots</h2>
      <BaseButton variant="tertiary" trailing-caret disabled aria-describedby="pots-unavailable">
        See Details
      </BaseButton>
      <p id="pots-unavailable" class="sr-only">The Pots page is not available yet.</p>
    </header>
    <div class="flex min-w-0 flex-col gap-5 md:flex-row md:items-start">
      <div
        class="flex min-w-0 items-center gap-4 rounded-xl bg-beige-100 p-4 md:min-h-[110px] md:flex-1"
      >
        <IconPot class="size-10 shrink-0 text-green" />
        <div>
          <p class="mb-3 text-gray-500">Total Saved</p>
          <p class="text-preset-1">{{ formatCurrency(totalSaved, 0) }}</p>
        </div>
      </div>
      <div class="min-w-0 md:flex-1">
        <div
          role="region"
          aria-label="Savings pots"
          aria-describedby="pots-scroll-help"
          tabindex="0"
          class="h-[102px] overflow-y-auto rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
        >
          <ul class="grid auto-rows-[43px] grid-cols-2 gap-x-4 gap-y-4">
            <li
              v-for="pot in demo.pots"
              :key="pot.name"
              class="min-w-0 rounded-xs border-l-4 pl-4"
              :style="{ borderColor: pot.theme }"
            >
              <p class="text-preset-5 text-gray-500">{{ pot.name }}</p>
              <p class="mt-1 text-preset-4 font-bold">{{ formatCurrency(pot.total, 0) }}</p>
            </li>
          </ul>
        </div>
        <p id="pots-scroll-help" class="sr-only">
          Use arrow keys when focused, swipe, or scroll to reach all five pots.
        </p>
      </div>
    </div>
  </section>
</template>
