"use client"

import { ImageDown, Link2, Palette } from "lucide-react"
import { motion } from "motion/react"

import { ContributionGraph } from "@/components/contribution-graph"
import { GitHubMark } from "@/components/github-mark"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCount } from "@/lib/format"
import {
  SAMPLE_PROFILES,
  SAMPLE_YEAR,
  type SampleProfile,
} from "@/lib/sample"
import { getTheme, THEMES, type ThemeId } from "@/lib/themes"

const EXAMPLE_USERS = ["torvalds", "gaearon", "midudev", "antfu"]

const STEPS = [
  {
    icon: Link2,
    title: "Paste your profile",
    text: "Nick, @nick, or a GitHub URL.",
  },
  {
    icon: Palette,
    title: "Pick the look",
    text: `Pick the years and one of ${THEMES.length} themes.`,
  },
  {
    icon: ImageDown,
    title: "Save the image",
    text: "A PNG ready to post, with a margin.",
  },
]

const FAN_POSITIONS = [
  "hidden md:block md:-translate-x-[46%] md:-rotate-[5deg] md:scale-[0.92] z-0",
  "z-10",
  "hidden md:block md:translate-x-[46%] md:rotate-[5deg] md:scale-[0.92] z-0",
]

export function ExampleUsers({
  disabled,
  onPick,
}: {
  disabled: boolean
  onPick: (login: string) => void
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      <span className="text-xs text-muted-foreground">Try with</span>
      {EXAMPLE_USERS.map((login) => (
        <Button
          key={login}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="rounded-full pl-1"
          onClick={() => onPick(login)}
        >
          <Avatar size="sm">
            <AvatarImage
              src={`https://github.com/${login}.png?size=48`}
              alt=""
            />
            <AvatarFallback>{login[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          {login}
        </Button>
      ))}
    </div>
  )
}

function SampleCard({
  sample,
  active,
}: {
  sample: SampleProfile
  active: boolean
}) {
  const theme = getTheme(sample.themeId)
  const { year } = sample

  return (
    <div
      className="text-left"
      style={{
        background: theme.background,
        color: theme.text,
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
        padding: "18px 20px 14px",
        boxShadow: active
          ? `0 0 0 2px ${theme.levels[3]}, 0 24px 60px -24px ${theme.levels[2]}`
          : "0 24px 60px -28px rgba(0,0,0,0.9)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            style={{
              background: `linear-gradient(135deg, ${theme.levels[2]}, ${theme.levels[4]})`,
              color: theme.base,
            }}
          >
            {sample.name[0]}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base leading-tight font-semibold">
              {sample.name}
            </p>
            <p
              className="mt-0.5 truncate text-xs"
              style={{ color: theme.muted }}
            >
              @{sample.login} • {formatCount(sample.followers)} Followers
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span style={{ color: theme.text }}>
            <GitHubMark size={22} />
          </span>
          <p className="mt-1.5 text-xs font-medium">
            {formatCount(year.total)} Commits
          </p>
        </div>
      </div>

      <p className="mt-4 mb-1.5 text-[11px]" style={{ color: theme.muted }}>
        <span className="font-medium" style={{ color: theme.year }}>
          {SAMPLE_YEAR}
        </span>
        <span className="mx-1.5" />
        {formatCount(year.total)} Commits, {formatCount(year.activeDays)} Days
      </p>
      <ContributionGraph days={year.days} year={SAMPLE_YEAR} theme={theme} />
    </div>
  )
}

export function EmptyState({
  activeTheme,
  onPickTheme,
}: {
  activeTheme: ThemeId
  onPickTheme: (id: ThemeId) => void
}) {
  return (
    <div className="flex w-full flex-col items-center gap-14">
      <section className="flex w-full flex-col items-center gap-5">
        <div className="relative grid w-full place-items-center overflow-x-clip py-8">
          {SAMPLE_PROFILES.map((sample, index) => (
            <div
              key={sample.themeId}
              className={`col-start-1 row-start-1 ${FAN_POSITIONS[index]}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: [0, -6, 0] }}
                transition={{
                  opacity: { duration: 0.5, delay: 0.1 + index * 0.1 },
                  y: {
                    duration: 6 + index,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.6 + index * 0.2,
                  },
                }}
              >
                <button
                  type="button"
                  aria-label={`Start with the ${getTheme(sample.themeId).name} theme`}
                  aria-pressed={activeTheme === sample.themeId}
                  onClick={() => onPickTheme(sample.themeId)}
                  className="block w-[min(520px,86vw)] cursor-pointer rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:w-[min(460px,52vw)]"
                >
                  <SampleCard
                    sample={sample}
                    active={activeTheme === sample.themeId}
                  />
                </button>
              </motion.div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Sample cards. Click one to start with that theme.
        </p>
      </section>

      <section className="grid w-full max-w-[880px] gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <Card size="sm" className="h-full bg-card/40 ring-foreground/8">
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground">
                    <step.icon className="size-4" />
                  </span>
                  <Badge variant="outline">0{index + 1}</Badge>
                </div>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.text}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </section>
    </div>
  )
}
