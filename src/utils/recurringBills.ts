type Transaction = {
  name: string
  date: string
  amount: number
  recurring: boolean
}

// Payment dates are ISO UTC dates. reportingDate is a calendar date (YYYY-MM-DD).
export function summarizeRecurringBills(
  transactions: readonly Transaction[],
  reportingDate: string,
) {
  const month = reportingDate.slice(0, 7)
  const latestPayments = new Map<string, Transaction>()

  for (const transaction of transactions) {
    if (!transaction.recurring) continue
    if (transaction.amount > 0) {
      throw new Error(`Recurring bill payment cannot be positive: ${transaction.name}`)
    }
    if (transaction.date.slice(0, 10) > reportingDate) continue
    const latest = latestPayments.get(transaction.name)
    if (!latest || transaction.date > latest.date) {
      latestPayments.set(transaction.name, transaction)
    }
  }

  let paidCents = 0
  let upcomingCents = 0
  let dueSoonCents = 0
  const [year, monthNumber, day] = reportingDate.split('-').map(Number) as [number, number, number]
  const dueSoonThrough = Date.UTC(year, monthNumber - 1, day + 7)
  const lastDayOfMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()

  for (const payment of latestPayments.values()) {
    const cents = Math.round(-payment.amount * 100)
    if (payment.date.startsWith(month)) {
      paidCents += cents
    } else {
      upcomingCents += cents
      const billingDay = Number(payment.date.slice(8, 10))
      const dueDate = Date.UTC(year, monthNumber - 1, Math.min(billingDay, lastDayOfMonth))
      // No lower bound: overdue bills in this reporting month also need attention.
      if (dueDate <= dueSoonThrough) dueSoonCents += cents
    }
  }

  return { paid: paidCents / 100, upcoming: upcomingCents / 100, dueSoon: dueSoonCents / 100 }
}
