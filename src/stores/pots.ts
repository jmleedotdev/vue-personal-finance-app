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
  // Preview and confirmation share validation, but confirmation always reads live state.
  function previewAddition(id: string, input: string) {
    const pot = pots.value.find((pot) => pot.id === id)
    const amount = parsePositiveUsd(input)
    if (!pot || amount === null)
      return { error: 'Enter an amount above $0 with up to 2 decimal places.' }
    if (amount > currentBalance.value)
      return { error: `Enter an amount within your available Current Balance.` }
    const savedCents = Math.round(pot.total * 100)
    const balanceCents = Math.round(currentBalance.value * 100)
    const amountCents = Math.round(amount * 100)
    const totalCents = savedCents + amountCents
    const remainingCents = balanceCents - amountCents
    const total = totalCents / 100
    const balance = remainingCents / 100
    if (
      !Number.isSafeInteger(savedCents) ||
      savedCents < 0 ||
      !Number.isSafeInteger(balanceCents) ||
      balanceCents < 0 ||
      !Number.isSafeInteger(totalCents) ||
      parsePositiveUsd(String(total)) !== total ||
      (balance !== 0 && parsePositiveUsd(String(balance)) !== balance)
    )
      return { error: 'This addition would exceed the supported safe monetary values.' }
    return { error: '', total, balance }
  }
  function addMoney(id: string, input: string) {
    const result = previewAddition(id, input)
    const pot = pots.value.find((pot) => pot.id === id)
    if (!pot || result.total === undefined || result.balance === undefined) return false
    // Synchronous validation and mutation: neither side changes on a rejected transfer.
    pot.total = result.total
    currentBalance.value = result.balance
    return true
  }
  return {
    pots,
    previewAddition,
    addMoney,
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
