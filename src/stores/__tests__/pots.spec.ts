import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, it } from 'vitest'
import { usePotsStore } from '@/stores/pots'

beforeEach(() => setActivePinia(createPinia()))

it('returns funded savings in cents and removes the pot exactly once, preserving survivor order', () => {
  const store = usePotsStore()
  const id = store.pots[0]!.id
  store.pots[0]!.total = 159.01
  store.currentBalance = 4835.99
  const survivors = store.pots.slice(1).map((pot) => ({ ...pot }))
  expect(store.deletePot(id)).toBe(true)
  expect(store.currentBalance).toBe(4995)
  expect(store.totalSaved).toBe(761)
  expect(store.pots).toEqual(survivors)
  expect(store.deletePot(id)).toBe(false)
  expect(store.currentBalance).toBe(4995)
  expect(store.currentBalance + store.totalSaved).toBe(5756)
})

it.each([
  [90071992547409.9, 159],
  [70368744177664, 0.01],
  [4836, -1],
  [4836, 1.001],
  [4836, Infinity],
  [NaN, 159],
  [-1, 159],
  [1.001, 159],
])('rejects an unsafe deletion atomically for balance %s and savings %s', (balance, saved) => {
  const store = usePotsStore()
  store.currentBalance = balance
  store.pots[0]!.total = saved
  const before = store.pots.map((pot) => ({ ...pot }))
  expect(store.deletePot(store.pots[0]!.id)).toBe(false)
  expect(store.currentBalance).toBe(balance)
  expect(store.pots).toEqual(before)
})

it('deletes an empty pot without changing available funds and releases its name and theme', () => {
  const store = usePotsStore()
  const pot = { ...store.pots[0]!, total: 0 }
  store.pots[0]!.total = 0
  expect(store.deletePot(pot.id)).toBe(true)
  expect(store.currentBalance).toBe(4836)
  expect(store.addPot({ name: pot.name, target: pot.target, theme: pot.theme })).toBe(true)
  expect(store.pots[store.pots.length - 1]?.total).toBe(0)
})
