import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import demo from '@/data/demo.json'

export const usePotsStore = defineStore('pots', () => {
  const pots = ref(demo.pots.map((pot) => ({ ...pot })))
  // Bundled Current Balance already excludes the savings held in pots.
  const currentBalance = ref(demo.balance.current)
  const totalSaved = computed(
    () => pots.value.reduce((cents, pot) => cents + Math.round(pot.total * 100), 0) / 100,
  )
  return { pots, currentBalance, totalSaved }
})

export type Pot = ReturnType<typeof usePotsStore>['pots'][number]
