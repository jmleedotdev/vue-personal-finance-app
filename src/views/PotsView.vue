<script setup lang="ts">
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/BaseButton.vue'
import PotCard from '@/components/PotCard.vue'
import { usePotsStore } from '@/stores/pots'

const { pots } = storeToRefs(usePotsStore())
</script>

<template>
  <main
    id="main-content"
    tabindex="-1"
    class="mx-auto flex w-full max-w-[1520px] min-w-0 flex-col gap-8 px-4 pt-6 pb-[calc(84px+env(safe-area-inset-bottom))] md:px-10 md:pt-8 md:pb-[calc(109px+env(safe-area-inset-bottom))] xl:pb-8"
  >
    <header class="flex min-h-14 items-center justify-between gap-4">
      <h1 class="text-preset-1">Pots</h1>
      <BaseButton disabled>+ Add New Pot</BaseButton>
    </header>
    <div class="grid min-w-0 gap-6 xl:grid-cols-2">
      <PotCard v-for="pot in pots" :key="pot.id" :pot="pot" />
    </div>
  </main>
</template>
