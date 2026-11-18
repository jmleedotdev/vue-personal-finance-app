<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import IconEllipsis from '@/components/icons/IconEllipsis.vue'
import type { Pot } from '@/stores/pots'
import { formatCurrency } from '@/utils/currency'

const { pot } = defineProps<{ pot: Pot }>()
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
      <BaseButton variant="tertiary" disabled :aria-label="`Manage ${pot.name} pot`">
        <IconEllipsis />
      </BaseButton>
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
      <BaseButton variant="secondary" disabled>+ Add Money</BaseButton>
      <BaseButton variant="secondary" disabled>Withdraw</BaseButton>
    </div>
  </article>
</template>
