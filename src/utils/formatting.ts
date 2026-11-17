export const locale = 'en-US'

const dateFormatter = new Intl.DateTimeFormat(locale, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatCalendarDate(date: string): string {
  const parts = dateFormatter.formatToParts(new Date(date))
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)!.value
  return `${part('day')} ${part('month')} ${part('year')}`
}
