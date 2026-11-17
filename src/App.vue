<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavigation from '@/components/AppNavigation.vue'
</script>

<template>
  <a
    href="#main-content"
    class="sr-only z-30 rounded-lg bg-white p-4 text-gray-900 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
    >Skip to content</a
  >
  <div class="min-h-dvh xl:flex xl:items-start">
    <AppNavigation />
    <RouterView />
  </div>
</template>
