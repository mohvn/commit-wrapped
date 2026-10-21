import type { YearWrapped } from "@/lib/types"

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

export function yearsRangeLabel(years: YearWrapped[]): string {
  const sorted = years.map((year) => year.year).sort((a, b) => a - b)
  if (sorted.length === 0) return ""
  if (sorted.length === 1) return String(sorted[0])
  const contiguous = sorted.every(
    (year, index) => index === 0 || year === sorted[index - 1] + 1,
  )
  return contiguous ? `${sorted[0]} – ${sorted.at(-1)}` : sorted.join(", ")
}

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const
