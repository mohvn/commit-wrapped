import { MONTH_LABELS } from "@/lib/format"
import type { WrappedTheme } from "@/lib/themes"
import type { ContributionDay } from "@/lib/types"

const CELL = 11
const GAP = 3
const LABEL_H = 16

function utcDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`)
}

function buildWeeks(days: ContributionDay[]): ContributionDay[][] {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))
  if (sorted.length === 0) return []

  const byDate = new Map(sorted.map((day) => [day.date, day]))
  const start = utcDate(sorted[0].date)
  start.setUTCDate(start.getUTCDate() - start.getUTCDay())
  const end = utcDate(sorted[sorted.length - 1].date)
  end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()))

  const weeks: ContributionDay[][] = []
  const cursor = new Date(start)

  while (cursor.getTime() <= end.getTime()) {
    const week: ContributionDay[] = []
    for (let index = 0; index < 7; index += 1) {
      const key = cursor.toISOString().slice(0, 10)
      week.push(byDate.get(key) ?? { date: key, count: 0, level: 0 })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

function monthMarkers(
  weeks: ContributionDay[][],
  year: number,
): { label: string; col: number }[] {
  const markers: { label: string; col: number }[] = []

  weeks.forEach((week, col) => {
    const firstOfMonth = week.find(
      (day) => day.date.startsWith(`${year}-`) && day.date.endsWith("-01"),
    )
    if (!firstOfMonth) return
    const month = Number(firstOfMonth.date.slice(5, 7))
    markers.push({ label: MONTH_LABELS[month - 1], col })
  })

  return markers
}

export function ContributionGraph({
  days,
  year,
  theme,
}: {
  days: ContributionDay[]
  year: number
  theme: WrappedTheme
}) {
  const weeks = buildWeeks(days)
  const months = monthMarkers(weeks, year)
  const step = CELL + GAP
  const width = Math.max(0, weeks.length * step - GAP)
  const height = LABEL_H + 7 * step - GAP

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMinYMid meet"
      role="img"
      aria-label={`Contribution graph for ${year}`}
      style={{ display: "block", height: "auto" }}
    >
      {months.map((month) => (
        <text
          key={`${month.label}-${month.col}`}
          x={month.col * step}
          y={11}
          fill={theme.muted}
          fontSize="11"
          fontFamily="Geist, ui-sans-serif, system-ui, sans-serif"
        >
          {month.label}
        </text>
      ))}
      {weeks.map((week, col) =>
        week.map((day, row) => (
          <rect
            key={day.date}
            x={col * step}
            y={LABEL_H + row * step}
            width={CELL}
            height={CELL}
            rx={2}
            fill={theme.levels[day.level]}
          >
            <title>{`${day.count} on ${day.date}`}</title>
          </rect>
        )),
      )}
    </svg>
  )
}
