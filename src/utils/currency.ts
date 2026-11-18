import { locale } from '@/utils/formatting'

const formatters = {
  0: new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
  2: new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
}

// Parse decimal USD without rounding, and reject values whose cents cannot be
// safely represented and displayed by the application's number-based model.
export function parsePositiveUsd(input: string): number | null {
  const value = input.trim()
  if (!/^(?:\d+(\.\d{0,2})?|\.\d{1,2})$/.test(value)) return null
  const [dollars = '0', fraction = ''] = value.split('.')
  const cents = BigInt(dollars) * 100n + BigInt(fraction.padEnd(2, '0'))
  if (cents <= 0n || cents > BigInt(Number.MAX_SAFE_INTEGER)) return null
  const amount = Number(cents) / 100
  if (
    Math.round(amount * 100) !== Number(cents) ||
    BigInt(formatCurrency(amount).replace(/\D/g, '')) !== cents
  )
    return null
  return amount
}

export function formatCurrency(amount: number, fractionDigits: 0 | 2 = 2): string {
  return formatters[fractionDigits].format(amount)
}
