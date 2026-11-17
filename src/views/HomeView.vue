<script setup lang="ts">
import BalanceSummary from '@/components/BalanceSummary.vue'
</script>

<template>
  <main
    id="main-content"
    tabindex="-1"
    class="mx-auto flex w-full max-w-[1520px] min-w-0 flex-col gap-8 px-4 pt-6 pb-[calc(84px+env(safe-area-inset-bottom))] md:px-10 md:pt-8 md:pb-[calc(109px+env(safe-area-inset-bottom))] xl:pb-8"
  >
    <h1 class="text-preset-1 md:flex md:h-14 md:items-center">Overview</h1>
    <BalanceSummary />
  </main>
</template>
