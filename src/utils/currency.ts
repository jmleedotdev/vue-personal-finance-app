const formatters = {
  0: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
  2: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
}

export function formatCurrency(amount: number, fractionDigits: 0 | 2 = 2): string {
  return formatters[fractionDigits].format(amount)
}
