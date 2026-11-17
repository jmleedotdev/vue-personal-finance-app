<script setup lang="ts">
import demo from '@/data/demo.json'
import BaseButton from '@/components/BaseButton.vue'
import { formatCurrency } from '@/utils/currency'

const avatarAssets = import.meta.glob<string>(
  '@/assets/images/avatars/{emma-richardson,savory-bites-bistro,daniel-carter,sun-park,urban-services-hub,liam-hughes,lily-ramirez,ethan-clark,james-thompson,pixel-playground}.jpg',
  { eager: true, query: '?url', import: 'default' },
)
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const transactions = demo.transactions.slice(0, 10).map((transaction) => ({
  ...transaction,
  avatar: avatarAssets[transaction.avatar],
  calendarDate: transaction.date.slice(0, 10),
  displayDate: dateFormatter.format(new Date(transaction.date)),
  displayAmount: `${transaction.amount > 0 ? '+' : ''}${formatCurrency(transaction.amount)}`,
}))
</script>

<template>
  <section
    aria-labelledby="transactions-heading"
    class="min-w-0 rounded-xl bg-white px-5 py-6 md:p-8"
  >
    <header class="mb-8 flex items-center justify-between gap-4">
      <h2 id="transactions-heading" class="text-preset-2">Transactions</h2>
      <BaseButton
        variant="tertiary"
        trailing-caret
        disabled
        aria-describedby="transactions-unavailable"
        class="shrink-0"
      >
        View All
      </BaseButton>
      <p id="transactions-unavailable" class="sr-only">
        The Transactions page is not available yet.
      </p>
    </header>
    <div
      role="region"
      aria-label="Recent transactions"
      aria-describedby="transactions-scroll-help"
      tabindex="0"
      class="-mr-[15px] h-[399px] overflow-y-auto rounded-xs pr-[15px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
    >
      <ul class="divide-y divide-gray-100">
        <li
          v-for="transaction in transactions"
          :key="transaction.name"
          class="flex min-w-0 items-center gap-3 py-5 first:pt-0 last:pb-0 md:gap-4"
        >
          <img
            :src="transaction.avatar"
            alt=""
            class="size-8 shrink-0 rounded-full object-cover md:size-10"
          />
          <h3
            class="min-w-0 flex-1 text-preset-5 font-bold wrap-break-word md:text-preset-4 md:font-bold"
          >
            {{ transaction.name }}
          </h3>
          <div class="shrink-0 text-right">
            <p
              class="text-preset-4 font-bold"
              :class="transaction.amount > 0 ? 'text-green' : 'text-gray-900'"
            >
              {{ transaction.displayAmount }}
            </p>
            <time
              :datetime="transaction.calendarDate"
              class="mt-2 block text-preset-5 whitespace-nowrap text-gray-500"
              >{{ transaction.displayDate }}</time
            >
          </div>
        </li>
      </ul>
    </div>
    <p id="transactions-scroll-help" class="sr-only">
      Use arrow keys when focused, swipe, or scroll to reach all ten transactions.
    </p>
  </section>
</template>
