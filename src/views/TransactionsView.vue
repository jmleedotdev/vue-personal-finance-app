<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TransactionPagination from '@/components/TransactionPagination.vue'
import demo from '@/data/demo.json'
import { formatCurrency } from '@/utils/currency'
import { formatCalendarDate } from '@/utils/formatting'

const avatarAssets = import.meta.glob<string>('@/assets/images/avatars/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})
const transactions = demo.transactions
  .map((transaction, index) => ({
    ...transaction,
    index,
    calendarDate: transaction.date.slice(0, 10),
  }))
  .sort((a, b) => b.calendarDate.localeCompare(a.calendarDate))

const route = useRoute()
const router = useRouter()
const pageSize = 10
const pageCount = Math.max(1, Math.ceil(transactions.length / pageSize))
const page = computed(() => {
  const value = route.query.page
  const requested = typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : 1
  return Math.min(requested, pageCount)
})
watch(
  () => route.query.page,
  (value) => {
    const normalized = page.value === 1 ? undefined : String(page.value)
    if (value !== normalized) {
      void router.replace({ query: { ...route.query, page: normalized } })
    }
  },
  { immediate: true },
)
const visibleTransactions = computed(() =>
  transactions.slice((page.value - 1) * pageSize, page.value * pageSize),
)

const heading = useTemplateRef<HTMLHeadingElement>('heading')

async function changePage(nextPage: number) {
  if (nextPage === page.value) return
  const failure = await router.push({
    query: { ...route.query, page: nextPage === 1 ? undefined : String(nextPage) },
  })
  if (failure) return
  await nextTick()
  heading.value?.focus({ preventScroll: true })
  heading.value?.scrollIntoView?.({ block: 'start' })
}
</script>

<template>
  <main
    id="main-content"
    tabindex="-1"
    class="mx-auto flex w-full max-w-[1520px] min-w-0 flex-col gap-8 px-4 pt-6 pb-[calc(84px+env(safe-area-inset-bottom))] md:px-10 md:pt-8 md:pb-[calc(109px+env(safe-area-inset-bottom))] xl:pb-8"
  >
    <h1
      ref="heading"
      tabindex="-1"
      class="scroll-mt-6 text-preset-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green md:flex md:h-14 md:scroll-mt-8 md:items-center"
    >
      Transactions
    </h1>
    <section aria-label="Transaction history" class="min-w-0 rounded-xl bg-white px-5 py-6 md:p-8">
      <p v-if="transactions.length === 0" class="py-6 text-center text-gray-500">
        No transactions found
      </p>
      <table v-else class="w-full table-fixed border-collapse">
        <caption class="sr-only">
          Latest transactions, ordered by UTC calendar date
        </caption>
        <thead class="sr-only md:not-sr-only">
          <tr class="border-b border-gray-100 text-left text-preset-5 text-gray-500">
            <th scope="col" class="w-[46%] py-[21px] font-normal xl:px-4 xl:py-3">
              Recipient / Sender
            </th>
            <th scope="col" class="w-[15%] px-2 py-[21px] font-normal xl:py-3">Category</th>
            <th scope="col" class="w-[22%] px-2 py-[21px] font-normal xl:py-3">Transaction Date</th>
            <th scope="col" class="py-[21px] text-right font-normal xl:px-4 xl:py-3">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="transaction in visibleTransactions"
            :key="transaction.index"
            class="transaction-row border-b border-gray-100 last:border-0"
          >
            <th scope="row" class="transaction-person min-w-0 py-4 text-left xl:px-4">
              <div class="flex min-w-0 items-center gap-3 md:gap-4">
                <img
                  :src="avatarAssets[transaction.avatar]"
                  alt=""
                  class="size-8 shrink-0 rounded-full object-cover md:size-10"
                />
                <span class="min-w-0 text-preset-4 font-bold wrap-break-word">{{
                  transaction.name
                }}</span>
              </div>
            </th>
            <td class="transaction-category text-preset-5 text-gray-500 md:px-2 md:py-4">
              {{ transaction.category }}
            </td>
            <td
              class="transaction-date text-preset-5 whitespace-nowrap text-gray-500 md:px-2 md:py-4"
            >
              <time :datetime="transaction.calendarDate">{{
                formatCalendarDate(transaction.date)
              }}</time>
            </td>
            <td
              class="transaction-amount text-right text-preset-4 font-bold whitespace-nowrap md:py-4 xl:px-4"
              :class="transaction.amount > 0 ? 'text-green' : 'text-gray-900'"
            >
              {{ transaction.amount > 0 ? '+' : '' }}{{ formatCurrency(transaction.amount) }}
            </td>
          </tr>
        </tbody>
      </table>
      <TransactionPagination :page="page" :page-count="pageCount" @change="changePage" />
    </section>
  </main>
</template>

<style scoped>
@media (width >= 48rem) {
  .transaction-row:first-child > * {
    padding-top: 24px;
  }
  .transaction-row:last-child > * {
    padding-bottom: 24px;
  }
}
@media (width < 48rem) {
  .transaction-row:first-child {
    padding-top: 24px;
  }
  .transaction-row:last-child {
    padding-bottom: 24px;
  }
  .transaction-row {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 0.75rem;
    row-gap: 0.25rem;
    padding-block: 1rem;
  }
  .transaction-person {
    grid-column: 1;
    grid-row: 1;
    padding: 0 0 0 2.75rem;
  }
  .transaction-person img {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }
  .transaction-category {
    grid-column: 1;
    grid-row: 2;
    padding-left: 2.75rem;
  }
  .transaction-amount {
    grid-column: 2;
    grid-row: 1;
  }
  .transaction-date {
    grid-column: 2;
    grid-row: 2;
    text-align: right;
  }
}
</style>
