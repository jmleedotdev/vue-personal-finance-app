<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import BasePagination from '@/components/BasePagination.vue'
import { useRoute, useRouter } from 'vue-router'
import BaseSelect from '@/components/BaseSelect.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import IconSort from '@/components/icons/IconSort.vue'
import { sortOptions } from '@/utils/sortOptions'
import demo from '@/data/demo.json'
import { formatCurrency } from '@/utils/currency'
import { REPORTING_DATE, summarizeRecurringBills } from '@/utils/recurringBills'
import billsIcon from '@/assets/icons/recurring-bills.svg'
import paidIcon from '@/assets/icons/bill-paid.svg'
import dueIcon from '@/assets/icons/bill-due.svg'

const totals = summarizeRecurringBills(demo.transactions, REPORTING_DATE)
const route = useRoute()
const router = useRouter()
const appliedSearch = computed(() =>
  typeof route.query.search === 'string' ? route.query.search.trim() : '',
)
const draftSearch = ref(appliedSearch.value)
const sort = computed(() =>
  sortOptions.some((option) => option.value === route.query.sort)
    ? String(route.query.sort)
    : 'Oldest',
)

async function changeSort(value: string) {
  await router.push({
    query: { ...route.query, sort: value === 'Oldest' ? undefined : value, page: undefined },
  })
}

async function submitSearch() {
  draftSearch.value = draftSearch.value.trim()
  await router.push({
    query: { ...route.query, search: draftSearch.value || undefined, page: undefined },
  })
}

const matchingBills = computed(() =>
  totals.bills
    .filter((bill) => bill.name.toLowerCase().includes(appliedSearch.value.toLowerCase()))
    .sort((a, b) => {
      switch (sort.value) {
        case 'Latest':
          return b.dueDate.localeCompare(a.dueDate)
        case 'A to Z':
          return a.name.localeCompare(b.name)
        case 'Z to A':
          return b.name.localeCompare(a.name)
        case 'Highest':
          return b.amount - a.amount
        case 'Lowest':
          return a.amount - b.amount
        default:
          return a.dueDate.localeCompare(b.dueDate)
      }
    }),
)
const pageSize = 10
const pageCount = computed(() => Math.max(1, Math.ceil(matchingBills.value.length / pageSize)))
const page = computed(() => {
  const value = route.query.page
  const requested = typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : 1
  return Math.min(requested, pageCount.value)
})
const bills = computed(() =>
  matchingBills.value.slice((page.value - 1) * pageSize, page.value * pageSize),
)
watch(
  () => route.query,
  (query) => {
    draftSearch.value = appliedSearch.value
    const normalizedSearch = appliedSearch.value || undefined
    const normalizedSort = sort.value === 'Oldest' ? undefined : sort.value
    const normalizedPage = page.value === 1 ? undefined : String(page.value)
    if (
      query.sort !== normalizedSort ||
      query.search !== normalizedSearch ||
      query.page !== normalizedPage
    ) {
      void router.replace({
        query: { ...query, search: normalizedSearch, sort: normalizedSort, page: normalizedPage },
      })
    }
  },
  { immediate: true },
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

const summaries = [
  { label: 'Paid Bills', count: totals.paidCount, amount: totals.paid },
  { label: 'Total Upcoming', count: totals.upcomingCount, amount: totals.upcoming },
  { label: 'Due Soon', count: totals.dueSoonCount, amount: totals.dueSoon },
]
const avatars = import.meta.glob<string>('@/assets/images/avatars/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})

function ordinal(day: number) {
  const suffix = day >= 11 && day <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] ?? 'th')
  return `${day}${suffix}`
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
      class="flex h-14 scroll-mt-6 items-center text-preset-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green md:scroll-mt-8"
    >
      Recurring Bills
    </h1>
    <div class="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,337fr)_minmax(0,699fr)] xl:items-start">
      <div class="grid min-w-0 gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-1">
        <section
          aria-labelledby="total-bills-heading"
          class="flex min-w-0 items-center gap-6 rounded-xl bg-gray-900 p-6 text-white md:flex-col md:items-start md:justify-between md:gap-8"
        >
          <span class="flex size-10 shrink-0 items-center justify-center"
            ><img :src="billsIcon" alt=""
          /></span>
          <dl class="min-w-0">
            <dt id="total-bills-heading">Total Bills</dt>
            <dd class="mt-3 text-preset-1">{{ formatCurrency(totals.total) }}</dd>
          </dl>
        </section>
        <section aria-labelledby="bill-summary-heading" class="min-w-0 rounded-xl bg-white p-5">
          <h2 id="bill-summary-heading" class="mb-5 text-preset-3">Summary</h2>
          <dl class="divide-y divide-gray-100 text-preset-5">
            <div
              v-for="summary in summaries"
              :key="summary.label"
              class="flex min-w-0 items-center justify-between gap-2 py-4 first:pt-0 last:pb-0"
              :class="summary.label === 'Due Soon' ? 'text-red' : 'text-gray-500'"
            >
              <dt>{{ summary.label }}</dt>
              <dd
                class="shrink-0 font-bold"
                :class="summary.label === 'Due Soon' ? '' : 'text-gray-900'"
              >
                {{ summary.count }} ({{ formatCurrency(summary.amount) }})
              </dd>
            </div>
          </dl>
        </section>
      </div>
      <section
        aria-label="Monthly recurring bills"
        class="min-w-0 rounded-xl bg-white px-5 py-6 md:p-8"
      >
        <div class="mb-6 flex min-w-0 items-center gap-4 md:gap-6">
          <form
            role="search"
            aria-label="Search bills"
            class="mr-auto min-w-0 flex-1 md:max-w-80"
            @submit.prevent="submitSearch"
          >
            <BaseInput
              v-model="draftSearch"
              label="Search bills"
              aria-label="Search bills"
              hide-label
              placeholder="Search bills"
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
            aria-label="Sort bills"
            :model-value="sort"
            :options="sortOptions"
            @update:model-value="changeSort"
          >
            <template #icon><IconSort /></template>
          </BaseSelect>
        </div>
        <table v-if="bills.length" class="block w-full md:table">
          <caption class="sr-only">
            Monthly recurring bills, sorted by
            {{
              sort
            }}
          </caption>
          <thead class="sr-only md:not-sr-only md:table-header-group">
            <tr class="border-b border-gray-100 text-left text-preset-5 text-gray-500">
              <th scope="col" class="px-4 pt-0 pb-3 font-normal">Bill Title</th>
              <th scope="col" class="pt-0 pb-3 font-normal">Due Date</th>
              <th scope="col" class="px-4 pt-0 pb-3 text-right font-normal">Amount</th>
            </tr>
          </thead>
          <tbody class="block md:table-row-group">
            <tr
              v-for="bill in bills"
              :key="bill.name"
              class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 border-b border-gray-100 py-5 first:pt-0 last:border-0 last:pb-0 md:table-row md:py-0"
            >
              <th scope="row" class="col-span-2 min-w-0 text-left md:w-[56%] md:px-4 md:py-5">
                <div class="flex min-w-0 items-center gap-4">
                  <img
                    :src="bill.avatar ? avatars[bill.avatar] : undefined"
                    alt=""
                    class="size-8 shrink-0 rounded-full object-cover"
                  />
                  <span class="min-w-0 text-preset-4 font-bold wrap-anywhere">{{ bill.name }}</span>
                </div>
              </th>
              <td
                class="text-preset-5 text-gray-500 md:py-5"
                :class="bill.status === 'Paid' ? 'text-green' : ''"
              >
                <div class="flex items-center gap-2 whitespace-nowrap">
                  <time :datetime="bill.dueDate">Monthly - {{ ordinal(bill.billingDay) }}</time>
                  <span :aria-label="bill.status" role="img">
                    <img
                      v-if="bill.status !== 'Upcoming'"
                      :src="bill.status === 'Paid' ? paidIcon : dueIcon"
                      alt=""
                      class="shrink-0"
                    />
                  </span>
                </div>
              </td>
              <td
                class="text-right text-preset-4 font-bold md:px-4 md:py-5"
                :class="bill.status === 'Due Soon' ? 'text-red' : ''"
              >
                {{ formatCurrency(bill.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="py-8 text-center text-gray-500">No bills found</p>
        <BasePagination
          label="Bill pages"
          :page="page"
          :page-count="pageCount"
          @change="changePage"
        />
      </section>
    </div>
  </main>
</template>
