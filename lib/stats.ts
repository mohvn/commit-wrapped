import type { YearWrapped } from "@/lib/types"

const DAY_MS = 86_400_000

const monthName = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "UTC",
})
const monthShort = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})
const weekdayName = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: "UTC",
})
const dayLabel = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

export type WrappedStats = {
  longestStreak: number
  bestDay: { count: number; label: string } | null
  topMonth: { count: number; label: string } | null
  topWeekday: { count: number; label: string } | null
}

function utc(date: string) {
  return new Date(`${date}T00:00:00.000Z`)
}

function maxEntry<K>(map: Map<K, number>): [K, number] | null {
  let best: [K, number] | null = null
  for (const entry of map) {
    if (entry[1] > 0 && (!best || entry[1] > best[1])) best = entry
  }
  return best
}

export function computeStats(years: YearWrapped[]): WrappedStats {
  const counts = new Map<string, number>()
  for (const year of years) {
    for (const day of year.days) {
      if (day.date.startsWith(`${year.year}-`)) counts.set(day.date, day.count)
    }
  }

  const days = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))
  const singleYear = new Set(years.map((year) => year.year)).size === 1

  let longestStreak = 0
  let streak = 0
  let previous: number | null = null
  let bestDay: [string, number] | null = null
  const months = new Map<string, number>()
  const weekdays = new Map<number, number>()

  for (const [date, count] of days) {
    const time = utc(date).getTime()
    if (count > 0) {
      streak = previous !== null && time - previous === DAY_MS ? streak + 1 : 1
      previous = time
      longestStreak = Math.max(longestStreak, streak)
    } else {
      streak = 0
      previous = null
    }

    if (count > 0 && (!bestDay || count > bestDay[1])) bestDay = [date, count]

    const month = date.slice(0, 7)
    months.set(month, (months.get(month) ?? 0) + count)
    const weekday = utc(date).getUTCDay()
    weekdays.set(weekday, (weekdays.get(weekday) ?? 0) + count)
  }

  const topMonth = maxEntry(months)
  const topWeekday = maxEntry(weekdays)

  return {
    longestStreak,
    bestDay: bestDay
      ? { count: bestDay[1], label: dayLabel.format(utc(bestDay[0])) }
      : null,
    topMonth: topMonth
      ? {
          count: topMonth[1],
          label: (singleYear ? monthName : monthShort).format(
            utc(`${topMonth[0]}-01`),
          ),
        }
      : null,
    topWeekday: topWeekday
      ? {
          count: topWeekday[1],
          label: weekdayName.format(new Date(Date.UTC(2024, 0, 7 + topWeekday[0]))),
        }
      : null,
  }
}

export function yearsRangeLabel(years: YearWrapped[]): string {
  const sorted = years.map((year) => year.year).sort((a, b) => a - b)
  if (sorted.length === 0) return ""
  if (sorted.length === 1) return String(sorted[0])
  const contiguous = sorted.every(
    (year, index) => index === 0 || year === sorted[index - 1] + 1,
  )
  return contiguous
    ? `${sorted[0]} – ${sorted.at(-1)}`
    : sorted.join(", ")
}
