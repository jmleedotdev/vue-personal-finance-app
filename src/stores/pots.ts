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
  function potThemeOptions(excludeId?: string) {
    return budgetThemes.map((theme) => {
      const disabled = pots.value.some(
        (pot) => pot.id !== excludeId && pot.theme.toUpperCase() === theme.value,
      )
      return { ...theme, disabled, disabledText: disabled ? 'Already used' : '' }
    })
  }
  const themeOptions = computed(() => potThemeOptions())
  const canAddPot = computed(() => themeOptions.value.some((theme) => !theme.disabled))
  function validInput(input: PotInput, excludeId?: string) {
    const name = input.name.trim()
    return !(
      !name ||
      name.length > 30 ||
      pots.value.some(
        (pot) => pot.id !== excludeId && pot.name.trim().toLowerCase() === name.toLowerCase(),
      ) ||
      parsePositiveUsd(String(input.target)) !== input.target ||
      !potThemeOptions(excludeId).some((theme) => theme.value === input.theme && !theme.disabled)
    )
  }
  function addPot(input: PotInput) {
    if (!validInput(input)) return false
    pots.value.push({ ...input, name: input.name.trim(), id: crypto.randomUUID(), total: 0 })
    return true
  }
  function updatePot(id: string, input: PotInput) {
    const pot = pots.value.find((pot) => pot.id === id)
    if (!pot || !validInput(input, id)) return false
    Object.assign(pot, { name: input.name.trim(), target: input.target, theme: input.theme })
    return true
  }
  return {
    pots,
    currentBalance,
    totalSaved,
    themeOptions,
    canAddPot,
    addPot,
    potThemeOptions,
    updatePot,
  }
})

export type Pot = ReturnType<typeof usePotsStore>['pots'][number]
