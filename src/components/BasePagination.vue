<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import IconCaretLeft from '@/components/icons/IconCaretLeft.vue'
import IconCaretRight from '@/components/icons/IconCaretRight.vue'

const { page, pageCount, label } = defineProps<{
  page: number
  pageCount: number
  label: string
}>()
const emit = defineEmits<{ change: [page: number] }>()
const pages = computed(() =>
  Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = index + 1
    const compact =
      pageNumber === 1 ||
      pageNumber === pageCount ||
      pageNumber === page ||
      (page <= 2 && pageNumber === 2) ||
      (page >= pageCount - 1 && pageNumber === pageCount - 1)
    return { page: pageNumber, compact }
  }),
)
</script>

<template>
  <nav
    v-if="pageCount > 1"
    :aria-label="label"
    class="mt-6 flex items-center justify-between gap-2"
  >
    <BaseButton
      variant="pagination"
      class="max-[22rem]:min-w-8 max-[22rem]:px-2"
      aria-label="Previous page"
      :disabled="page === 1"
      @click="emit('change', page - 1)"
    >
      <IconCaretLeft class="size-4" />
      <span class="hidden md:inline">Previous</span>
    </BaseButton>
    <ol class="flex items-center gap-1 md:gap-2">
      <li
        v-for="(item, index) in pages"
        :key="item.page"
        :class="{
          'hidden min-[28rem]:block':
            !item.compact && (index === 0 || pages[index - 1]?.compact === false),
        }"
      >
        <BaseButton
          variant="pagination"
          class="max-[22rem]:min-w-8 max-[22rem]:px-2"
          :aria-label="`Page ${item.page}`"
          :aria-current="page === item.page ? 'page' : undefined"
          :class="{ 'max-[28rem]:hidden': !item.compact }"
          @click="emit('change', item.page)"
        >
          {{ item.page }}
        </BaseButton>
        <span
          v-if="!item.compact && pages[index - 1]?.compact"
          class="flex size-4 items-center justify-center min-[28rem]:hidden"
          aria-hidden="true"
          >…</span
        >
      </li>
    </ol>
    <BaseButton
      variant="pagination"
      class="max-[22rem]:min-w-8 max-[22rem]:px-2"
      aria-label="Next page"
      :disabled="page === pageCount"
      @click="emit('change', page + 1)"
    >
      <span class="hidden md:inline">Next</span>
      <IconCaretRight class="size-4" />
    </BaseButton>
  </nav>
</template>
