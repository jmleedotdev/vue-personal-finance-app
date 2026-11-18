import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import demo from '@/data/demo.json'
import { parsePositiveUsd } from '@/utils/currency'
import { budgetThemes } from '@/utils/budgetThemes'

export type PotTransferOperation = 'add' | 'withdraw'
export type PotInput = { name: string; target: number; theme: string }

function isNonNegativeUsdAmount(amount: number) {
  return amount === 0 || parsePositiveUsd(String(amount)) === amount
}

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
  function deletePot(id: string) {
    const index = pots.value.findIndex((pot) => pot.id === id)
    const pot = pots.value[index]
    if (!pot) return false
    const balanceCents = Math.round(currentBalance.value * 100)
    const savedCents = Math.round(pot.total * 100)
    const returnedCents = balanceCents + savedCents
    const balance = returnedCents / 100
    if (
      !isNonNegativeUsdAmount(currentBalance.value) ||
      !isNonNegativeUsdAmount(pot.total) ||
      !Number.isSafeInteger(returnedCents) ||
      Math.round(balance * 100) !== returnedCents ||
      !isNonNegativeUsdAmount(balance)
    )
      return false
    // Validate before changing either side; a removed identity cannot return money twice.
    currentBalance.value = balance
    pots.value.splice(index, 1)
    return true
  }
  // Preview and confirmation share validation, but confirmation always reads live state.
  function previewTransfer(id: string, input: string, operation: PotTransferOperation) {
    const pot = pots.value.find((pot) => pot.id === id)
    const amount = parsePositiveUsd(input)
    if (!pot || amount === null)
      return { error: 'Enter an amount above $0 with up to 2 decimal places.' }
    if (operation === 'add' && amount > currentBalance.value)
      return { error: 'Enter an amount within your available Current Balance.' }
    if (operation === 'withdraw' && amount > pot.total)
      return { error: 'Enter an amount within this pot’s saved amount.' }
    const savedCents = Math.round(pot.total * 100)
    const balanceCents = Math.round(currentBalance.value * 100)
    const amountCents = Math.round(amount * 100)
    const changeCents = operation === 'add' ? amountCents : -amountCents
    const totalCents = savedCents + changeCents
    const remainingCents = balanceCents - changeCents
    const total = totalCents / 100
    const balance = remainingCents / 100
    if (
      !Number.isSafeInteger(savedCents) ||
      savedCents < 0 ||
      !Number.isSafeInteger(balanceCents) ||
      balanceCents < 0 ||
      !Number.isSafeInteger(totalCents) ||
      !Number.isSafeInteger(remainingCents) ||
      totalCents < 0 ||
      remainingCents < 0 ||
      // Safe integer cents can still lose a cent when converted to decimal dollars.
      Math.round(total * 100) !== totalCents ||
      Math.round(balance * 100) !== remainingCents ||
      !isNonNegativeUsdAmount(total) ||
      !isNonNegativeUsdAmount(balance)
    )
      return { error: 'This transfer would exceed the supported safe monetary values.' }
    return { error: '', total, balance }
  }
  function transferMoney(id: string, input: string, operation: PotTransferOperation) {
    const result = previewTransfer(id, input, operation)
    const pot = pots.value.find((pot) => pot.id === id)
    if (!pot || result.total === undefined || result.balance === undefined) return false
    // Synchronous validation and mutation: neither side changes on a rejected transfer.
    pot.total = result.total
    currentBalance.value = result.balance
    return true
  }
  return {
    pots,
    deletePot,
    previewTransfer,
    transferMoney,
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
