"use client"

import axios from "axios"
import { toPng } from "html-to-image"
import { LoaderCircle } from "lucide-react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { useSearchParams } from "next/navigation"
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { CardToolbar, type CopiedTarget } from "@/components/card-toolbar"
import { EmptyState, ExampleUsers } from "@/components/empty-state"
import { GitHubMark } from "@/components/github-mark"
import { WrappedCard } from "@/components/wrapped-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CARD_FORMATS,
  type CardFormat,
  DEFAULT_CARD_FORMAT,
  isCardFormat,
} from "@/lib/formats"
import { parseGithubInput } from "@/lib/parse-username"
import {
  DEFAULT_THEME_ID,
  getTheme,
  isThemeId,
  type ThemeId,
} from "@/lib/themes"
import type { WrappedPayload } from "@/lib/types"

const EXPORT_PIXEL_RATIO = 2
const EXPORT_MARGIN = 48
const COPIED_FEEDBACK_MS = 2000

function defaultYears(data: WrappedPayload): number[] {
  const current = new Date().getUTCFullYear()
  const thisYear = data.years.find((year) => year.year === current)
  if (thisYear) return [thisYear.year]
  const latest = data.years.at(-1)
  return latest ? [latest.year] : []
}

function parseYearsParam(value: string | null): number[] {
  if (!value) return []
  return value
    .split(",")
    .map((part) => Number.parseInt(part, 10))
    .filter((year) => Number.isInteger(year) && year > 2000)
}

function buildQuery({
  login,
  theme,
  years,
  format,
}: {
  login: string
  theme: ThemeId
  years: number[]
  format: CardFormat
}) {
  const params = new URLSearchParams({ u: login, theme })
  if (years.length > 0) {
    params.set(
      "years",
      [...years].sort((a, b) => b - a).join(","),
    )
  }
  if (format !== DEFAULT_CARD_FORMAT) params.set("format", format)
  return params.toString().replaceAll("%2C", ",")
}

async function framedBlob(
  dataUrl: string,
  margin: number,
  background: string,
): Promise<Blob> {
  const image = new window.Image()
  image.src = dataUrl
  await image.decode()

  const canvas = document.createElement("canvas")
  canvas.width = image.width + margin * 2
  canvas.height = image.height + margin * 2
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D context unavailable")

  ctx.fillStyle = background
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, margin, margin)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Empty PNG"))),
      "image/png",
    )
  })
}

function copyWithTextarea(text: string) {
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  try {
    return document.execCommand("copy")
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}

function CardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-[20px] border border-white/6 p-8"
      style={{ width: 1000, background: "#0b0b0b" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-5">
          <Skeleton className="size-[76px] rounded-full bg-white/8" />
          <div className="space-y-3 pt-1">
            <Skeleton className="h-7 w-48 bg-white/10" />
            <Skeleton className="h-4 w-72 bg-white/8" />
            <Skeleton className="h-4 w-64 bg-white/6" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="ml-auto size-10 rounded-full bg-white/8" />
          <Skeleton className="h-5 w-28 bg-white/8" />
        </div>
      </div>
      <Skeleton className="mt-10 h-[110px] w-full bg-white/5" />
    </div>
  )
}

function ScaledCard({
  children,
  width,
  height,
  frameKey,
  framed,
}: {
  children: ReactNode
  width: number
  height: number | null
  frameKey: string
  framed?: boolean
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const update = () => {
      const byWidth = frame.clientWidth / width
      const byHeight = height ? (window.innerHeight * 0.78) / height : 1
      setScale(Math.min(1, byWidth, byHeight))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(frame)
    window.addEventListener("resize", update)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [frameKey, width, height])

  return (
    <div ref={frameRef} className="flex w-full justify-center">
      <div
        className={
          framed
            ? "overflow-hidden rounded-[20px] shadow-2xl ring-1 shadow-black/40 ring-white/8"
            : undefined
        }
        style={{ width, zoom: scale }}
      >
        {children}
      </div>
    </div>
  )
}

function ProfileForm({
  value,
  onChange,
  onSubmit,
  loading,
  avatarUrl,
  compact,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  loading: boolean
  avatarUrl?: string
  compact?: boolean
}) {
  return (
    <form
      className={
        compact
          ? "flex w-full gap-2 sm:max-w-sm"
          : "mt-8 flex w-full max-w-xl flex-col gap-2 sm:flex-row"
      }
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="relative min-w-0 flex-1">
        <span className="pointer-events-none absolute top-1/2 left-3 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground">
          {avatarUrl ? (
            <Avatar className="size-5">
              <AvatarImage src={avatarUrl} alt="" />
            </Avatar>
          ) : (
            <GitHubMark size={16} />
          )}
        </span>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            compact ? "Another profile…" : "mohvn, @mohvn, or github.com/mohvn"
          }
          className={
            compact
              ? "h-9 bg-input/40 pr-3 pl-9 text-sm"
              : "h-10 bg-input/40 pr-3 pl-9 text-sm"
          }
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          name="username"
        />
      </div>
      <Button
        type="submit"
        size={compact ? "default" : "lg"}
        className={compact ? "h-9 px-4" : "h-10 px-5"}
        disabled={loading}
      >
        {loading ? (
          <>
            <LoaderCircle className="animate-spin" />
            Generating
          </>
        ) : compact ? (
          "Go"
        ) : (
          "Generate wrapped"
        )}
      </Button>
    </form>
  )
}

export function WrappedApp() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("u") ?? ""
  const initialTheme = searchParams.get("theme")
  const initialFormat = searchParams.get("format")
  const [initialYears] = useState(() =>
    parseYearsParam(searchParams.get("years")),
  )

  const [input, setInput] = useState(initialQuery)
  const [data, setData] = useState<WrappedPayload | null>(null)
  const [selectedYears, setSelectedYears] = useState<number[]>([])
  const [themeId, setThemeId] = useState<ThemeId>(
    initialTheme && isThemeId(initialTheme) ? initialTheme : DEFAULT_THEME_ID,
  )
  const [format, setFormat] = useState<CardFormat>(
    initialFormat && isCardFormat(initialFormat)
      ? initialFormat
      : DEFAULT_CARD_FORMAT,
  )
  const [loading, setLoading] = useState(Boolean(initialQuery))
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<CopiedTarget>(null)
  const [error, setError] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const autoLoaded = useRef(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const theme = getTheme(themeId)
  const frame = CARD_FORMATS[format]

  const visibleYears = useMemo(() => {
    if (!data) return []
    const selected = new Set(selectedYears)
    return data.years
      .filter((year) => selected.has(year.year))
      .sort((a, b) => b.year - a.year)
  }, [data, selectedYears])

  const query = data
    ? buildQuery({
        login: data.user.login,
        theme: themeId,
        years: selectedYears,
        format,
      })
    : null

  useEffect(() => {
    if (!query || window.location.search === `?${query}`) return
    window.history.replaceState(null, "", `?${query}`)
  }, [query])

  useEffect(() => () => clearTimeout(copiedTimer.current), [])

  function flashCopied(target: Exclude<CopiedTarget, null>) {
    clearTimeout(copiedTimer.current)
    setCopied(target)
    copiedTimer.current = setTimeout(() => setCopied(null), COPIED_FEEDBACK_MS)
  }

  async function loadUser(raw: string, preferredYears: number[] = []) {
    const username = parseGithubInput(raw)
    if (!username) {
      setLoading(false)
      setError("Paste a GitHub nick or URL, like mohvn or github.com/mohvn.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get<WrappedPayload>(
        `/api/wrapped/${encodeURIComponent(username)}`,
      )
      const available = new Set(response.data.years.map((year) => year.year))
      const preferred = preferredYears.filter((year) => available.has(year))
      setData(response.data)
      setSelectedYears(
        preferred.length > 0 ? preferred : defaultYears(response.data),
      )
      setInput(response.data.user.login)
    } catch (cause) {
      const fallback = "Couldn't generate the wrapped. Try again."
      if (axios.isAxiosError(cause)) {
        const message = (cause.response?.data as { message?: string } | undefined)
          ?.message
        setError(message || fallback)
      } else {
        setError(fallback)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoLoaded.current) return
    if (!initialQuery) return
    autoLoaded.current = true
    queueMicrotask(() => void loadUser(initialQuery, initialYears))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once from the URL
  }, [initialQuery])

  function goHome() {
    setData(null)
    setSelectedYears([])
    setInput("")
    setError(null)
    window.history.replaceState(null, "", window.location.pathname)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function renderCardBlob(): Promise<Blob> {
    const node = cardRef.current
    if (!node) throw new Error("Card not mounted")

    const scaled = node.parentElement
    const previousZoom = scaled?.style.zoom ?? ""
    if (scaled) scaled.style.zoom = "1"
    try {
      const png = await toPng(node, {
        pixelRatio: EXPORT_PIXEL_RATIO,
        cacheBust: true,
        backgroundColor: theme.base,
      })
      const margin =
        format === "wide" ? EXPORT_MARGIN * EXPORT_PIXEL_RATIO : 0
      return await framedBlob(png, margin, theme.base)
    } finally {
      if (scaled) scaled.style.zoom = previousZoom
    }
  }

  async function handleDownload() {
    if (!data) return
    setSaving(true)
    setError(null)
    try {
      const blob = await renderCardBlob()
      const yearsLabel =
        visibleYears.length === data.years.length
          ? "all"
          : visibleYears.map((year) => year.year).join("-")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = `commit-wrapped-${data.user.login}-${yearsLabel}-${theme.id}-${format}.png`
      link.href = url
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 0)
    } catch {
      setError("Couldn't save the image. Try again.")
    } finally {
      setSaving(false)
    }
  }

  function handleCopyImage() {
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
      setError("This browser can't copy images. Use Save instead.")
      return
    }
    setSaving(true)
    setError(null)
    // Safari only allows clipboard writes started synchronously inside the click.
    navigator.clipboard
      .write([new ClipboardItem({ "image/png": renderCardBlob() })])
      .then(() => flashCopied("image"))
      .catch(() => setError("Couldn't copy the image. Try Save instead."))
      .finally(() => setSaving(false))
  }

  async function handleCopyLink() {
    if (!query) return
    const url = `${window.location.origin}${window.location.pathname}?${query}`
    setError(null)
    try {
      await navigator.clipboard.writeText(url)
      flashCopied("link")
    } catch {
      if (copyWithTextarea(url)) flashCopied("link")
      else setError("Couldn't copy the link.")
    }
  }

  const exportSize =
    frame.height === null
      ? `${(frame.width + EXPORT_MARGIN * 2) * EXPORT_PIXEL_RATIO} px wide`
      : `${frame.width * EXPORT_PIXEL_RATIO} × ${frame.height * EXPORT_PIXEL_RATIO}`

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-full flex-1 flex-col bg-background">
        {data ? (
          <header className="mx-auto flex w-full max-w-[1032px] flex-col gap-3 px-4 pt-6 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={goHome}
              title="Back to start"
              className="-ml-2 h-auto self-start px-2 py-1 font-[family-name:var(--font-crete-round)] text-2xl font-normal tracking-tight sm:self-auto"
            >
              Commit Wrapped
            </Button>
            <ProfileForm
              compact
              value={input}
              onChange={setInput}
              onSubmit={() => void loadUser(input)}
              loading={loading}
              avatarUrl={
                input === data.user.login ? data.user.avatarDataUrl : undefined
              }
            />
          </header>
        ) : (
          <header className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-16 pb-10 text-center">
            <h1 className="mt-3 font-[family-name:var(--font-crete-round)] text-4xl font-normal tracking-tight text-foreground sm:text-5xl">
              Commit Wrapped
            </h1>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              Your GitHub commit wrapped. Pick the years, the theme, and save the
              image.
            </p>

            <ProfileForm
              value={input}
              onChange={setInput}
              onSubmit={() => void loadUser(input)}
              loading={loading}
            />

            {!loading ? (
              <ExampleUsers
                disabled={loading}
                onPick={(login) => {
                  setInput(login)
                  void loadUser(login)
                }}
              />
            ) : null}
          </header>
        )}

        <main className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col items-center px-4 pb-20">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mb-6 w-full max-w-xl"
              >
                <Alert variant="destructive">
                  <AlertTitle>That didn&apos;t work</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {loading ? (
            <ScaledCard width={1000} height={null} frameKey="loading">
              <CardSkeleton />
            </ScaledCard>
          ) : null}

          {!data && !loading ? (
            <EmptyState activeTheme={themeId} onPickTheme={setThemeId} />
          ) : null}

          {data && !loading ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.18, visualDuration: 0.45 }}
              className="flex w-full flex-col items-center gap-5"
            >
              <CardToolbar
                years={data.years}
                selectedYears={selectedYears}
                onYearsChange={setSelectedYears}
                themeId={themeId}
                onThemeChange={setThemeId}
                format={format}
                onFormatChange={setFormat}
                onCopyLink={() => void handleCopyLink()}
                onCopyImage={handleCopyImage}
                onDownload={() => void handleDownload()}
                saving={saving}
                copied={copied}
                disabled={visibleYears.length === 0}
              />

              <ScaledCard
                width={frame.width}
                height={frame.height}
                framed={frame.height !== null}
                frameKey={`${format}-${visibleYears.map((year) => year.year).join("-")}`}
              >
                <div ref={cardRef}>
                  {visibleYears.length > 0 ? (
                    <WrappedCard
                      data={data}
                      years={visibleYears}
                      theme={theme}
                      format={format}
                    />
                  ) : null}
                </div>
              </ScaledCard>

              <p className="text-xs text-muted-foreground">
                PNG · {frame.label} · {exportSize}
              </p>
            </motion.div>
          ) : null}
        </main>
      </div>
    </MotionConfig>
  )
}
