import axios, { AxiosError, type AxiosRequestConfig } from "axios"
import { cacheLife } from "next/cache"

import { parseGithubInput } from "@/lib/parse-username"
import type {
  ContributionDay,
  ContributionLevel,
  WrappedPayload,
  WrappedUser,
  YearWrapped,
} from "@/lib/types"

const GITHUB_API = "https://api.github.com"
const GITHUB_WEB = "https://github.com"
const USER_AGENT = "commit-wrapped"

export class GithubError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "GithubError"
  }
}

function githubHeaders(html = false): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: html
      ? "text/html,application/xhtml+xml"
      : "application/vnd.github+json",
  }

  if (!html) {
    headers["X-GitHub-Api-Version"] = "2022-11-28"
  }

  const token = process.env.GITHUB_TOKEN
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

function toAxiosError(error: unknown): never {
  if (error instanceof GithubError) throw error

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 502
    if (status === 404) {
      throw new GithubError(404, "GitHub user not found.")
    }
    if (status === 403 || status === 429) {
      throw new GithubError(
        429,
        "GitHub rate-limited the requests. Try again in a few minutes, or set GITHUB_TOKEN.",
      )
    }
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message
    throw new GithubError(status, message || "Couldn't reach GitHub.")
  }

  throw new GithubError(500, "Couldn't reach GitHub.")
}

async function githubGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await axios.get<T>(url, {
      timeout: 20000,
      ...config,
    })
    return response.data
  } catch (error) {
    toAxiosError(error)
  }
}

function yearsOnGitHub(createdAt: string, now = new Date()): number {
  const created = new Date(createdAt)
  let years = now.getUTCFullYear() - created.getUTCFullYear()
  const monthDelta = now.getUTCMonth() - created.getUTCMonth()
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && now.getUTCDate() < created.getUTCDate())
  ) {
    years -= 1
  }
  return Math.max(1, years)
}

function clampLevel(value: number): ContributionLevel {
  if (value <= 0) return 0
  if (value >= 4) return 4
  return value as ContributionLevel
}

function parseContributionCount(text: string): number {
  const trimmed = text.trim()
  if (/^No contributions/i.test(trimmed)) return 0
  const match = trimmed.match(/([\d,]+)\s+contribution/i)
  return match ? Number(match[1].replace(/,/g, "")) : 0
}

export function parseContributionCalendar(
  html: string,
  year: number,
): YearWrapped {
  const tooltipById = new Map<string, number>()
  const tooltipRe =
    /<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/gi
  for (const match of html.matchAll(tooltipRe)) {
    tooltipById.set(match[1], parseContributionCount(match[2]))
  }

  const days: ContributionDay[] = []
  const tdRe = /<td\b[^>]*\bContributionCalendar-day\b[^>]*>/gi
  for (const match of html.matchAll(tdRe)) {
    const tag = match[0]
    const date = tag.match(/data-date="(\d{4}-\d{2}-\d{2})"/)?.[1]
    if (!date) continue
    const level = clampLevel(Number(tag.match(/data-level="(\d+)"/)?.[1] ?? 0))
    const id = tag.match(/\sid="([^"]+)"/)?.[1]
    const counted =
      id && tooltipById.has(id)
        ? tooltipById.get(id)!
        : level > 0
          ? 1
          : 0
    days.push({ date, count: counted, level })
  }

  const yearDays = days.filter((day) => day.date.startsWith(`${year}-`))
  const header = html.match(
    new RegExp(`([\\d,]+)\\s+contributions?\\s+in\\s+${year}`, "i"),
  )
  const total = header
        ? Number(header[1].replace(/,/g, ""))
    : yearDays.reduce((sum, day) => sum + day.count, 0)
  const activeDays = yearDays.filter((day) => day.count > 0).length

  return { year, total, activeDays, days }
}

async function toDataUrl(url: string): Promise<string> {
  try {
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: { "User-Agent": USER_AGENT },
    })
    const mime = String(response.headers["content-type"] ?? "image/png").split(
      ";",
    )[0]
    return `data:${mime};base64,${Buffer.from(response.data).toString("base64")}`
  } catch {
    return url
  }
}

type GithubApiUser = {
  login: string
  name: string | null
  bio: string | null
  avatar_url: string
  followers: number
  following: number
  created_at: string
  type?: string
}

async function fetchUserFromApi(username: string): Promise<WrappedUser> {
  const data = await githubGet<GithubApiUser>(`${GITHUB_API}/users/${username}`, {
    headers: githubHeaders(),
  })

  if (data.type && data.type !== "User") {
    throw new GithubError(400, "Use a user nick, not an organization.")
  }

  return {
    login: data.login,
    name: data.name?.trim() || data.login,
    bio: data.bio?.trim() || "",
    avatarDataUrl: await toDataUrl(data.avatar_url),
    followers: data.followers,
    following: data.following,
    createdAt: data.created_at,
    yearsOnGitHub: yearsOnGitHub(data.created_at),
    totalCommits: 0,
  }
}

function parseCountFromProfile(html: string, label: "followers" | "following"): number {
  const regex =
    label === "followers"
      ? /<span class="text-bold color-fg-default">([\d.kKmM,]+)<\/span>\s*followers/
      : /<span class="text-bold color-fg-default">([\d.kKmM,]+)<\/span>\s*following/
  const match = html.match(regex)
  if (!match) return 0
  const raw = match[1].replace(/,/g, "")
  if (/k$/i.test(raw)) return Math.round(Number.parseFloat(raw) * 1000)
  if (/m$/i.test(raw)) return Math.round(Number.parseFloat(raw) * 1_000_000)
  return Number(raw) || 0
}

async function fetchUserFromHtml(username: string): Promise<WrappedUser> {
  try {
    const html = await githubGet<string>(`${GITHUB_WEB}/${username}`, {
      headers: githubHeaders(true),
      responseType: "text",
    })

    if (
      /Not Found/i.test(html) &&
      /This is not the web page you are looking for/i.test(html)
    ) {
      throw new GithubError(404, "GitHub user not found.")
    }

    const login =
      html.match(/<meta property="profile:username" content="([^"]+)"/)?.[1] ??
      html.match(/itemprop="additionalName"[\s\S]*?>\s*([^<\s]+)/)?.[1]?.trim() ??
      username
    const name =
      html
        .match(/itemprop="name"[\s\S]*?>\s*([^<]+)/)?.[1]
        ?.trim() || login
    const bio =
      html.match(/data-bio-text="([^"]*)"/)?.[1]?.trim() ||
      html
        .match(/<meta property="og:image:alt" content="([^"]+)"/)?.[1]
        ?.split(".")[0]
        ?.trim() ||
      ""
    const avatar =
      html.match(
        /<meta property="og:image" content="(https:\/\/avatars\.githubusercontent\.com\/[^"?]+)/,
      )?.[1] ?? `https://avatars.githubusercontent.com/${login}`

    return {
      login,
      name,
      bio,
      avatarDataUrl: await toDataUrl(avatar),
      followers: parseCountFromProfile(html, "followers"),
      following: parseCountFromProfile(html, "following"),
      createdAt: "",
      yearsOnGitHub: 1,
      totalCommits: 0,
    }
  } catch (error) {
    toAxiosError(error)
  }
}

const LEVEL_FROM_GRAPHQL: Record<string, ContributionLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

type GraphqlYearResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        totalCommitContributions?: number
        contributionCalendar?: {
          totalContributions: number
          weeks: {
            contributionDays: {
              date: string
              contributionCount: number
              contributionLevel: string
            }[]
          }[]
        }
      }
    }
  }
  errors?: { message: string }[]
}

async function fetchYearFromGraphql(
  username: string,
  year: number,
): Promise<YearWrapped | null> {
  if (!process.env.GITHUB_TOKEN) return null

  const query = `
    query ($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await axios.post<GraphqlYearResponse>(
      `${GITHUB_API}/graphql`,
      {
        query,
        variables: {
          login: username,
          from: `${year}-01-01T00:00:00Z`,
          to: `${year}-12-31T23:59:59Z`,
        },
      },
      { headers: githubHeaders(), timeout: 20000 },
    )

    const collection = response.data.data?.user?.contributionsCollection
    const calendar = collection?.contributionCalendar
    if (!calendar) return null

    const days: ContributionDay[] = calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVEL_FROM_GRAPHQL[day.contributionLevel] ?? 0,
      })),
    )
    const yearDays = days.filter((day) => day.date.startsWith(`${year}-`))
    const total =
      calendar.totalContributions ??
      yearDays.reduce((sum, day) => sum + day.count, 0)

    return {
      year,
      total,
      activeDays: yearDays.filter((day) => day.count > 0).length,
      days,
    }
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
      return null
    }
    return null
  }
}

async function fetchYearFromHtml(
  username: string,
  year: number,
): Promise<YearWrapped> {
  const html = await githubGet<string>(
    `${GITHUB_WEB}/users/${username}/contributions`,
    {
      headers: githubHeaders(true),
      responseType: "text",
      params: {
        from: `${year}-01-01`,
        to: `${year}-12-31`,
      },
    },
  )

  const parsed = parseContributionCalendar(html, year)
  if (parsed.days.length === 0) {
    throw new GithubError(
      502,
      "Couldn't read the GitHub contribution calendar.",
    )
  }
  return parsed
}

async function fetchYear(username: string, year: number): Promise<YearWrapped> {
  const fromGraphql = await fetchYearFromGraphql(username, year)
  if (fromGraphql) return fromGraphql
  return fetchYearFromHtml(username, year)
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex
      nextIndex += 1
      results[current] = await mapper(items[current])
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker(),
  )
  await Promise.all(workers)
  return results
}

export type WrappedResult =
  | { ok: true; data: WrappedPayload }
  | { ok: false; status: number; message: string }

export async function getWrapped(rawUsername: string): Promise<WrappedResult> {
  "use cache"
  cacheLife("hours")

  try {
    const username = parseGithubInput(rawUsername)
    if (!username) {
      throw new GithubError(400, "Enter a valid GitHub nick or URL.")
    }

    let user: WrappedUser
    try {
      user = await fetchUserFromApi(username)
    } catch (error) {
      if (error instanceof GithubError && error.status === 404) {
        throw error
      }
      user = await fetchUserFromHtml(username)
    }

    const currentYear = new Date().getUTCFullYear()
    const createdYear = user.createdAt
      ? new Date(user.createdAt).getUTCFullYear()
      : currentYear - 7
    const startYear = Math.max(2008, createdYear)
    const yearNumbers: number[] = []
    for (let year = startYear; year <= currentYear; year += 1) {
      yearNumbers.push(year)
    }

    const years = await mapPool(yearNumbers, 4, (year) =>
      fetchYear(user.login, year),
    )

    const activeOrCurrent = years.filter(
      (year) => year.total > 0 || year.year === currentYear,
    )
    const selectedYears = activeOrCurrent.length > 0 ? activeOrCurrent : years
    const totalCommits = selectedYears.reduce((sum, year) => sum + year.total, 0)

    if (!user.createdAt && selectedYears.length > 0) {
      const firstYear = Math.min(...selectedYears.map((year) => year.year))
      user = {
        ...user,
        createdAt: `${firstYear}-01-01T00:00:00Z`,
        yearsOnGitHub: yearsOnGitHub(`${firstYear}-01-01T00:00:00Z`),
      }
    }

    return {
      ok: true,
      data: {
        user: { ...user, totalCommits },
        years: selectedYears,
      },
    }
  } catch (error) {
    if (error instanceof GithubError) {
      return { ok: false, status: error.status, message: error.message }
    }
    return { ok: false, status: 500, message: "Couldn't generate the wrapped." }
  }
}
