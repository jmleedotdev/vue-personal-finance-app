import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import demo from '@/data/demo.json'
import { parsePositiveUsd } from '@/utils/currency'
import { budgetThemes } from '@/utils/budgetThemes'

export type PotInput = { name: string; target: number; theme: string }

export const usePotsStore = defineStore('pots', () => {
  const pots = ref(demo.pots.map((pot) => ({ ...pot })))
  // Bundled Current Balance already excludes the savings held in pots.
  const currentBalance = ref(demo.balance.current)
  const totalSaved = computed(
    () => pots.value.reduce((cents, pot) => cents + Math.round(pot.total * 100), 0) / 100,
  )
  const themeOptions = computed(() =>
    budgetThemes.map((theme) => {
      const disabled = pots.value.some((pot) => pot.theme.toUpperCase() === theme.value)
      return { ...theme, disabled, disabledText: disabled ? 'Already used' : '' }
    }),
  )
  const canAddPot = computed(() => themeOptions.value.some((theme) => !theme.disabled))
  function addPot(input: PotInput) {
    const name = input.name.trim()
    if (
      !name ||
      name.length > 30 ||
      pots.value.some((pot) => pot.name.trim().toLowerCase() === name.toLowerCase()) ||
      parsePositiveUsd(String(input.target)) !== input.target ||
      !themeOptions.value.some((theme) => theme.value === input.theme && !theme.disabled)
    )
      return false
    pots.value.push({ ...input, name, id: crypto.randomUUID(), total: 0 })
    return true
  }
  return { pots, currentBalance, totalSaved, themeOptions, canAddPot, addPot }
})

export type Pot = ReturnType<typeof usePotsStore>['pots'][number]
