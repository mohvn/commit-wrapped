import type { ThemeId } from "@/lib/themes"
import type {
  ContributionDay,
  ContributionLevel,
  YearWrapped,
} from "@/lib/types"

export const SAMPLE_YEAR = 2025

export type SampleProfile = {
  themeId: ThemeId
  name: string
  login: string
  followers: number
  year: YearWrapped
}

function mulberry32(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function levelFor(count: number): ContributionLevel {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3
  return 4
}

function sampleYear(seed: number, intensity: number): YearWrapped {
  const random = mulberry32(seed)
  const start = Date.UTC(SAMPLE_YEAR, 0, 1)
  const days: ContributionDay[] = []
  let total = 0
  let activeDays = 0

  for (let index = 0; index < 365; index += 1) {
    const date = new Date(start + index * 86_400_000)
    const weekday = date.getUTCDay()
    const weekend = weekday === 0 || weekday === 6 ? 0.45 : 1
    const season = 0.65 + 0.35 * Math.sin((index / 365) * Math.PI * 4 + seed)
    const chance = Math.min(0.95, intensity * weekend * season)

    let count = 0
    if (random() < chance) {
      count = 1 + Math.floor(Math.pow(random(), 2.2) * 14 * season)
    }

    if (count > 0) activeDays += 1
    total += count
    days.push({
      date: date.toISOString().slice(0, 10),
      count,
      level: levelFor(count),
    })
  }

  return { year: SAMPLE_YEAR, total, activeDays, days }
}

export const SAMPLE_PROFILES: SampleProfile[] = [
  {
    themeId: "ocean",
    name: "Mona Lisa",
    login: "monalisa",
    followers: 2140,
    year: sampleYear(7, 0.8),
  },
  {
    themeId: "mono",
    name: "Octo Cat",
    login: "octocat",
    followers: 9812,
    year: sampleYear(21, 0.86),
  },
  {
    themeId: "halloween",
    name: "Hubot",
    login: "hubot",
    followers: 584,
    year: sampleYear(42, 0.72),
  },
]
