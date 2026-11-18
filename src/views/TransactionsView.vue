<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import BaseButton from '@/components/BaseButton.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import IconSort from '@/components/icons/IconSort.vue'
import IconFilter from '@/components/icons/IconFilter.vue'
import { useRoute, useRouter } from 'vue-router'
import TransactionPagination from '@/components/TransactionPagination.vue'
import demo from '@/data/demo.json'
import { formatCurrency } from '@/utils/currency'
import { formatCalendarDate } from '@/utils/formatting'
import { sortOptions } from '@/utils/sortOptions'

const avatarAssets = import.meta.glob<string>('@/assets/images/avatars/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})
const transactions = demo.transactions.map((transaction, index) => ({
  ...transaction,
  index,
  calendarDate: new Date(transaction.date).toISOString().slice(0, 10),
}))
const route = useRoute()
const router = useRouter()
const pageSize = 10
const appliedSearch = computed(() =>
  typeof route.query.search === 'string' ? route.query.search.trim() : '',
)
const draftSearch = ref(appliedSearch.value)
const categoryOptions = [
  { value: '', label: 'All Transactions' },
  ...[...new Set(transactions.map((transaction) => transaction.category))]
    .sort((a, b) => a.localeCompare(b))
    .map((category) => ({ value: category, label: category })),
]
const category = computed(() =>
  categoryOptions.some((option) => option.value === route.query.category)
    ? String(route.query.category)
    : '',
)
const sort = computed(() =>
  sortOptions.some((option) => option.value === route.query.sort)
    ? String(route.query.sort)
    : 'Latest',
)
const matchingTransactions = computed(() =>
  transactions
    .filter(
      (transaction) =>
        transaction.name.toLowerCase().includes(appliedSearch.value.toLowerCase()) &&
        (!category.value || transaction.category === category.value),
    )
    .sort((a, b) => {
      let comparison = 0
      switch (sort.value) {
        case 'Oldest':
          comparison = a.calendarDate.localeCompare(b.calendarDate)
          break
        case 'A to Z':
          comparison = a.name.localeCompare(b.name)
          break
        case 'Z to A':
          comparison = b.name.localeCompare(a.name)
          break
        case 'Highest':
          comparison = b.amount - a.amount
          break
        case 'Lowest':
          comparison = a.amount - b.amount
          break
        default:
          comparison = b.calendarDate.localeCompare(a.calendarDate)
      }
      return comparison || a.index - b.index
    }),
)

async function changeSort(value: string) {
  await router.push({
    query: { ...route.query, sort: value === 'Latest' ? undefined : value, page: undefined },
  })
}

async function changeCategory(value: string) {
  await router.push({ query: { ...route.query, category: value || undefined, page: undefined } })
}
const pageCount = computed(() =>
  Math.max(1, Math.ceil(matchingTransactions.value.length / pageSize)),
)
const page = computed(() => {
  const value = route.query.page
  const requested = typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : 1
  return Math.min(requested, pageCount.value)
})
watch(
  () => route.query,
  (query) => {
    draftSearch.value = appliedSearch.value
    const normalizedPage = page.value === 1 ? undefined : String(page.value)
    const normalizedSearch = appliedSearch.value || undefined
    const normalizedSort = sort.value === 'Latest' ? undefined : sort.value
    if (
      query.page !== normalizedPage ||
      query.search !== normalizedSearch ||
      query.category !== (category.value || undefined) ||
      query.sort !== normalizedSort
    ) {
      void router.replace({
        query: {
          ...query,
          page: normalizedPage,
          search: normalizedSearch,
          category: category.value || undefined,
          sort: normalizedSort,
        },
      })
    }
  },
  { immediate: true },
)
const visibleTransactions = computed(() =>
  matchingTransactions.value.slice((page.value - 1) * pageSize, page.value * pageSize),
)

async function submitSearch() {
  draftSearch.value = draftSearch.value.trim()
  await router.push({
    query: { ...route.query, search: draftSearch.value || undefined, page: undefined },
  })
}

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
      <div class="flex min-w-0 items-center gap-4 md:mb-6 md:gap-6">
        <form
          role="search"
          aria-label="Search transactions"
          class="min-w-0 flex-1 xl:mr-auto xl:max-w-80"
          @submit.prevent="submitSearch"
        >
          <BaseInput
            v-model="draftSearch"
            label="Search transactions"
            aria-label="Search transactions"
            hide-label
            placeholder="Search transaction"
            type="search"
          >
            <template #trailing>
              <BaseButton
                type="submit"
                variant="tertiary"
                aria-label="Submit search"
                class="size-9 cursor-pointer text-gray-900"
              >
                <IconSearch />
              </BaseButton>
            </template>
          </BaseInput>
        </form>
        <BaseSelect
          inline
          label="Sort by"
          aria-label="Sort transactions"
          :model-value="sort"
          :options="sortOptions"
          @update:model-value="changeSort"
          ><template #icon><IconSort /></template
        ></BaseSelect>
        <BaseSelect
          inline
          :active="Boolean(category)"
          label="Category"
          aria-label="Filter by category"
          :model-value="category"
          :options="categoryOptions"
          @update:model-value="changeCategory"
          ><template #icon><IconFilter /></template
        ></BaseSelect>
      </div>
      <p v-if="matchingTransactions.length === 0" class="py-6 text-center text-gray-500">
        No transactions found
      </p>
      <table v-else class="w-full table-fixed border-collapse">
        <caption class="sr-only">
          Transactions, sorted by
          {{
            sort
          }}
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
