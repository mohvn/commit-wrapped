"use client"

import {
  CalendarRange,
  ChartColumn,
  Check,
  ChevronDown,
  Copy,
  Download,
  Link2,
  LoaderCircle,
  RectangleHorizontal,
  RectangleVertical,
  Square,
} from "lucide-react"

import { Swatch, ThemePicker } from "@/components/theme-picker"
import { YearPicker } from "@/components/year-picker"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CARD_FORMATS, type CardFormat } from "@/lib/formats"
import { getTheme, type ThemeId } from "@/lib/themes"
import type { YearWrapped } from "@/lib/types"

const FORMAT_ICONS = {
  wide: RectangleHorizontal,
  square: Square,
  story: RectangleVertical,
} satisfies Record<CardFormat, unknown>

export type CopiedTarget = "link" | "image" | null

function yearsButtonLabel(all: YearWrapped[], selected: number[]) {
  if (selected.length === 0) return "Years"
  if (selected.length === all.length && all.length > 1) return "All years"
  const sorted = [...selected].sort((a, b) => a - b)
  if (sorted.length === 1) return String(sorted[0])
  const contiguous = sorted.every(
    (year, index) => index === 0 || year === sorted[index - 1] + 1,
  )
  return contiguous
    ? `${sorted[0]}–${sorted.at(-1)}`
    : `${sorted.length} years`
}

export function CardToolbar({
  years,
  selectedYears,
  onYearsChange,
  themeId,
  onThemeChange,
  format,
  onFormatChange,
  showStats,
  onShowStatsChange,
  onCopyLink,
  onCopyImage,
  onDownload,
  saving,
  copied,
  disabled,
}: {
  years: YearWrapped[]
  selectedYears: number[]
  onYearsChange: (years: number[]) => void
  themeId: ThemeId
  onThemeChange: (id: ThemeId) => void
  format: CardFormat
  onFormatChange: (format: CardFormat) => void
  showStats: boolean
  onShowStatsChange: (show: boolean) => void
  onCopyLink: () => void
  onCopyImage: () => void
  onDownload: () => void
  saving: boolean
  copied: CopiedTarget
  disabled: boolean
}) {
  const theme = getTheme(themeId)

  return (
    <div className="sticky top-3 z-20 flex w-full max-w-[1000px] flex-wrap items-center gap-1.5 rounded-xl border bg-background/75 p-1.5 shadow-lg shadow-black/20 backdrop-blur-md">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <CalendarRange className="text-muted-foreground" />
            {yearsButtonLabel(years, selectedYears)}
            <ChevronDown className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(92vw,26rem)] p-4">
          <YearPicker
            years={years}
            selected={selectedYears}
            onChange={onYearsChange}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Swatch theme={theme} />
            {theme.name}
            <ChevronDown className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(92vw,30rem)] p-4">
          <ThemePicker value={themeId} onChange={onThemeChange} />
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="mx-0.5 data-vertical:h-5 data-vertical:self-center" />

      <ToggleGroup
        type="single"
        size="sm"
        value={format}
        onValueChange={(next) => {
          if (next) onFormatChange(next as CardFormat)
        }}
        aria-label="Format"
      >
        {(Object.keys(CARD_FORMATS) as CardFormat[]).map((id) => {
          const Icon = FORMAT_ICONS[id]
          return (
            <ToggleGroupItem
              key={id}
              value={id}
              aria-label={CARD_FORMATS[id].label}
              title={CARD_FORMATS[id].label}
              className="gap-1.5 px-2.5"
            >
              <Icon />
              <span className="hidden md:inline">{CARD_FORMATS[id].label}</span>
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>

      <Toggle
        size="sm"
        pressed={showStats}
        onPressedChange={onShowStatsChange}
        aria-label={showStats ? "Hide stats" : "Show stats"}
        title={showStats ? "Hide stats" : "Show stats"}
        className="gap-1.5 px-2.5"
      >
        <ChartColumn />
        <span className="hidden md:inline">Stats</span>
      </Toggle>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopyLink}
          title="Copy link with theme, years, and format"
        >
          {copied === "link" ? <Check /> : <Link2 />}
          <span className="hidden sm:inline">
            {copied === "link" ? "Copied" : "Link"}
          </span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopyImage}
          disabled={disabled || saving}
        >
          {copied === "image" ? <Check /> : <Copy />}
          <span className="hidden sm:inline">
            {copied === "image" ? "Copied" : "Copy"}
          </span>
        </Button>
        <Button size="sm" onClick={onDownload} disabled={disabled || saving}>
          {saving ? <LoaderCircle className="animate-spin" /> : <Download />}
          Save
        </Button>
      </div>
    </div>
  )
}
