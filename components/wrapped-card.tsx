"use client"

import { Users } from "lucide-react"
import { type ReactNode, useLayoutEffect, useRef, useState } from "react"

import { ContributionGraph } from "@/components/contribution-graph"
import { GitHubMark } from "@/components/github-mark"
import { formatCount } from "@/lib/format"
import { CARD_FORMATS, type CardFormat } from "@/lib/formats"
import { computeStats, type WrappedStats, yearsRangeLabel } from "@/lib/stats"
import type { WrappedTheme } from "@/lib/themes"
import type { WrappedPayload, YearWrapped } from "@/lib/types"

const CARD_FONT = "Geist, ui-sans-serif, system-ui, sans-serif"

function plural(count: number, one: string, many: string) {
  return `${formatCount(count)} ${count === 1 ? one : many}`
}

function YearBlock({
  year,
  theme,
}: {
  year: YearWrapped
  theme: WrappedTheme
}) {
  return (
    <div className="w-full">
      <p
        className="mb-2 text-[13px] tracking-wide"
        style={{ color: theme.muted }}
      >
        <span className="font-medium" style={{ color: theme.year }}>
          {year.year}
        </span>
        <span className="mx-1.5"> </span>
        {plural(year.total, "Commit", "Commits")},{" "}
        {plural(year.activeDays, "Day", "Days")}
      </p>
      <ContributionGraph days={year.days} year={year.year} theme={theme} />
    </div>
  )
}

function StatTile({
  label,
  value,
  detail,
  theme,
  compact,
}: {
  label: string
  value: string
  detail?: string
  theme: WrappedTheme
  compact?: boolean
}) {
  return (
    <div
      className="min-w-0"
      style={{
        border: `1px solid ${theme.border}`,
        background: "rgba(255,255,255,0.025)",
        borderRadius: 12,
        padding: compact ? "10px 12px" : "12px 14px",
      }}
    >
      <p
        className="truncate text-[10.5px] font-medium tracking-[0.08em] uppercase"
        style={{ color: theme.muted }}
      >
        {label}
      </p>
      <p
        className="mt-1 truncate font-semibold tracking-tight"
        style={{ color: theme.text, fontSize: compact ? 15 : 18 }}
      >
        {value}
      </p>
      {detail ? (
        <p
          className="mt-0.5 truncate text-[11.5px]"
          style={{ color: theme.dim }}
        >
          {detail}
        </p>
      ) : null}
    </div>
  )
}

function StatGrid({
  stats,
  theme,
  columns,
  compact,
}: {
  stats: WrappedStats
  theme: WrappedTheme
  columns: 2 | 4
  compact?: boolean
}) {
  return (
    <div
      className="grid gap-2.5"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      <StatTile
        theme={theme}
        compact={compact}
        label={compact ? "Streak" : "Longest streak"}
        value={plural(stats.longestStreak, "day", "days")}
        detail="in a row"
      />
      <StatTile
        theme={theme}
        compact={compact}
        label="Best day"
        value={
          stats.bestDay ? plural(stats.bestDay.count, "commit", "commits") : "—"
        }
        detail={stats.bestDay?.label}
      />
      <StatTile
        theme={theme}
        compact={compact}
        label="Top month"
        value={stats.topMonth?.label ?? "—"}
        detail={
          stats.topMonth
            ? plural(stats.topMonth.count, "commit", "commits")
            : undefined
        }
      />
      <StatTile
        theme={theme}
        compact={compact}
        label="Favorite day"
        value={stats.topWeekday?.label ?? "—"}
        detail={
          stats.topWeekday
            ? plural(stats.topWeekday.count, "commit", "commits")
            : undefined
        }
      />
    </div>
  )
}

function Avatar({ src, size }: { src: string; size: number }) {
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      draggable={false}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
        background: "#1a1a1a",
      }}
    />
  )
}

function FitBox({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const update = () => {
      const available = outer.clientHeight
      const needed = inner.offsetHeight
      setScale(needed > available ? available / needed : 1)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(outer)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={outerRef}
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: "100%",
          flexShrink: 0,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: "center",
        }}
      >
        {children}
      </div>
    </div>
  )
}

function WideCard({
  data,
  years,
  theme,
  stats,
  shownCommits,
  showStats,
}: {
  data: WrappedPayload
  years: YearWrapped[]
  theme: WrappedTheme
  stats: WrappedStats
  shownCommits: number
  showStats: boolean
}) {
  const { user } = data

  return (
    <article
      style={{
        width: CARD_FORMATS.wide.width,
        background: theme.background,
        color: theme.text,
        borderRadius: 20,
        padding: "32px 36px 28px",
        fontFamily: CARD_FONT,
        overflow: "hidden",
        border: `1px solid ${theme.border}`,
      }}
    >
      <div className="flex items-start justify-between gap-8">
        <div className="flex min-w-0 items-start gap-5">
          <Avatar src={user.avatarDataUrl} size={76} />
          <div className="min-w-0 pt-0.5">
            <h2
              className="truncate text-[28px] leading-tight font-semibold tracking-tight"
              style={{ color: theme.text }}
            >
              {user.name}
            </h2>
            <div
              className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px]"
              style={{ color: theme.muted }}
            >
              <span>@{user.login}</span>
              <span style={{ color: "#4a4a4a" }}>•</span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {formatCount(user.followers)} Followers
              </span>
              <span style={{ color: "#4a4a4a" }}>•</span>
              <span>{formatCount(user.following)} Following</span>
            </div>
            {user.bio ? (
              <p
                className="mt-2 max-w-[34rem] text-[13px] leading-snug"
                style={{
                  color: theme.dim,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {user.bio}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end pt-0.5 text-right">
          <span style={{ color: theme.text }}>
            <GitHubMark size={38} />
          </span>
          <p className="mt-3 text-[17px] font-medium tracking-tight">
            {plural(shownCommits, "Commit", "Commits")}
          </p>
          <p className="mt-0.5 text-[13px]" style={{ color: theme.muted }}>
            {plural(user.yearsOnGitHub, "Year", "Years")}
          </p>
        </div>
      </div>

      {showStats ? (
        <div className="mt-7">
          <StatGrid stats={stats} theme={theme} columns={4} />
        </div>
      ) : null}

      <div
        className={`flex w-full flex-col gap-6 ${showStats ? "mt-7" : "mt-8"}`}
      >
        {years.map((year) => (
          <YearBlock key={year.year} year={year} theme={theme} />
        ))}
      </div>
    </article>
  )
}

function PosterCard({
  data,
  years,
  theme,
  stats,
  shownCommits,
  format,
  showStats,
}: {
  data: WrappedPayload
  years: YearWrapped[]
  theme: WrappedTheme
  stats: WrappedStats
  shownCommits: number
  format: "square" | "story"
  showStats: boolean
}) {
  const { user } = data
  const { width, height } = CARD_FORMATS[format]
  const story = format === "story"
  const activeDays = years.reduce((sum, year) => sum + year.activeDays, 0)

  return (
    <article
      style={{
        width,
        height: height ?? undefined,
        background: theme.background,
        color: theme.text,
        fontFamily: CARD_FONT,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: story ? "40px 36px 28px" : "28px 30px 20px",
      }}
    >
      <FitBox>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <Avatar src={user.avatarDataUrl} size={story ? 60 : 48} />
            <div className="min-w-0">
              <h2
                className="truncate leading-tight font-semibold tracking-tight"
                style={{ fontSize: story ? 24 : 20 }}
              >
                {user.name}
              </h2>
              <p
                className="mt-0.5 truncate text-[13px]"
                style={{ color: theme.muted }}
              >
                @{user.login} • {formatCount(user.followers)} Followers
              </p>
            </div>
          </div>
          <span style={{ color: theme.text }}>
            <GitHubMark size={story ? 30 : 26} />
          </span>
        </div>

        <div style={{ marginTop: story ? 40 : 22 }}>
          <p
            className="text-[12px] font-medium tracking-[0.1em] uppercase"
            style={{ color: theme.year }}
          >
            {yearsRangeLabel(years)}
          </p>
          <p
            className="mt-1.5 leading-none font-semibold tracking-tighter"
            style={{ fontSize: story ? 64 : 44 }}
          >
            {formatCount(shownCommits)}
          </p>
          <p className="mt-2 text-[14px]" style={{ color: theme.muted }}>
            {shownCommits === 1 ? "commit" : "commits"} ·{" "}
            {plural(activeDays, "active day", "active days")}
          </p>
        </div>

        {showStats ? (
          <div style={{ marginTop: story ? 28 : 18 }}>
            <StatGrid
              stats={stats}
              theme={theme}
              columns={story ? 2 : 4}
              compact={!story}
            />
          </div>
        ) : null}

        <div
          className="flex w-full flex-col"
          style={{ marginTop: story ? 32 : 20, gap: story ? 22 : 14 }}
        >
          {years.map((year) => (
            <YearBlock key={year.year} year={year} theme={theme} />
          ))}
        </div>
      </FitBox>

      <div
        className="flex items-center justify-between text-[12px]"
        style={{ color: theme.dim, marginTop: story ? 20 : 12 }}
      >
        <span
          style={{
            fontFamily: "var(--font-crete-round)",
            fontSize: 14,
            color: theme.muted,
          }}
        >
          Commit Wrapped
        </span>
        <span>{plural(user.yearsOnGitHub, "year", "years")} on GitHub</span>
      </div>
    </article>
  )
}

export function WrappedCard({
  data,
  years,
  theme,
  format = "wide",
  showStats = true,
}: {
  data: WrappedPayload
  years: YearWrapped[]
  theme: WrappedTheme
  format?: CardFormat
  showStats?: boolean
}) {
  const stats = computeStats(years)
  const shownCommits = years.reduce((sum, year) => sum + year.total, 0)

  if (format === "wide") {
    return (
      <WideCard
        data={data}
        years={years}
        theme={theme}
        stats={stats}
        shownCommits={shownCommits}
        showStats={showStats}
      />
    )
  }

  return (
    <PosterCard
      data={data}
      years={years}
      theme={theme}
      stats={stats}
      shownCommits={shownCommits}
      format={format}
      showStats={showStats}
    />
  )
}
