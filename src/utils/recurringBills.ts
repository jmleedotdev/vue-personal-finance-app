type Transaction = {
  name: string
  date: string
  amount: number
  recurring: boolean
  avatar?: string
}

export const REPORTING_DATE = '2024-08-19'

export type RecurringBill = {
  name: string
  avatar: string | undefined
  amount: number
  billingDay: number
  dueDate: string
  status: 'Paid' | 'Due Soon' | 'Upcoming'
}

// Evaluate UTC calendar days, including the whole reporting day, not the system clock.
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
    if (new Date(transaction.date).toISOString().slice(0, 10) > reportingDate) continue
    const latest = latestPayments.get(transaction.name)
    if (!latest || Date.parse(transaction.date) > Date.parse(latest.date)) {
      latestPayments.set(transaction.name, transaction)
    }
  }

  let paidCents = 0
  let upcomingCents = 0
  let dueSoonCents = 0
  let paidCount = 0
  let upcomingCount = 0
  let dueSoonCount = 0
  const bills: RecurringBill[] = []
  const [year, monthNumber, day] = reportingDate.split('-').map(Number) as [number, number, number]
  const dueSoonThrough = Date.UTC(year, monthNumber - 1, day + 7)
  const lastDayOfMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()

  for (const payment of latestPayments.values()) {
    const cents = Math.round(-payment.amount * 100)
    const paymentDate = new Date(payment.date)
    const billingDay = paymentDate.getUTCDate()
    const dueDate = Date.UTC(year, monthNumber - 1, Math.min(billingDay, lastDayOfMonth))
    let status: RecurringBill['status']
    if (paymentDate.toISOString().startsWith(month)) {
      paidCents += cents
      paidCount++
      status = 'Paid'
    } else {
      upcomingCents += cents
      upcomingCount++
      // No lower bound: overdue bills in this reporting month also need attention.
      if (dueDate <= dueSoonThrough) {
        dueSoonCents += cents
        dueSoonCount++
        status = 'Due Soon'
      } else status = 'Upcoming'
    }
    bills.push({
      name: payment.name,
      avatar: payment.avatar,
      amount: cents / 100,
      billingDay,
      dueDate: new Date(dueDate).toISOString().slice(0, 10),
      status,
    })
  }

  return {
    paid: paidCents / 100,
    upcoming: upcomingCents / 100,
    dueSoon: dueSoonCents / 100,
    total: (paidCents + upcomingCents) / 100,
    paidCount,
    upcomingCount,
    dueSoonCount,
    bills,
  }
}
