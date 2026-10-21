"use client"

import { cn } from "cn"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatCount } from "@/lib/format"
import type { YearWrapped } from "@/lib/types"

function sameYears(left: number[], right: number[]) {
  if (left.length !== right.length) return false
  const a = [...left].sort((x, y) => x - y)
  const b = [...right].sort((x, y) => x - y)
  return a.every((year, index) => year === b[index])
}

function presetsFor(years: YearWrapped[]) {
  const newestFirst = [...years].sort((a, b) => b.year - a.year)
  const current = new Date().getUTCFullYear()
  const ids = newestFirst.map((year) => year.year)
  const options: { id: string; label: string; years: number[] }[] = []

  if (ids.includes(current)) {
    options.push({ id: "current", label: "This year", years: [current] })
  }
  if (ids.includes(current - 1)) {
    options.push({
      id: "previous",
      label: "Last year",
      years: [current - 1],
    })
  }
  if (ids.length >= 3) {
    options.push({
      id: "recent-3",
      label: "Last 3",
      years: ids.slice(0, 3),
    })
  }
  if (ids.length > 1) {
    options.push({ id: "all", label: "All", years: ids })
  }

  return options
}

export function YearPicker({
  years,
  selected,
  onChange,
}: {
  years: YearWrapped[]
  selected: number[]
  onChange: (years: number[]) => void
}) {
  const newestFirst = [...years].sort((a, b) => b.year - a.year)
  const presets = presetsFor(years)
  const peak = Math.max(...years.map((year) => year.total), 1)
  const activePreset =
    presets.find((preset) => sameYears(preset.years, selected))?.id ?? ""
  const selectedTotal = years
    .filter((year) => selected.includes(year.year))
    .reduce((sum, year) => sum + year.total, 0)

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-3">
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Years in wrapped
        </p>
        <p className="text-xs text-muted-foreground">
          {selected.length === 1
            ? selected[0]
            : `${selected.length} years`}
          {" · "}
          {formatCount(selectedTotal)} commits
        </p>
      </div>

      {presets.length > 0 ? (
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={activePreset}
          onValueChange={(value) => {
            const preset = presets.find((item) => item.id === value)
            if (!preset) return
            onChange(preset.years)
          }}
          className="w-full flex-wrap justify-center"
        >
          {presets.map((preset) => (
            <ToggleGroupItem
              key={preset.id}
              value={preset.id}
              className="data-[state=on]:bg-foreground data-[state=on]:text-background"
            >
              {preset.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : null}

      <ToggleGroup
        type="multiple"
        variant="outline"
        value={selected.map(String)}
        onValueChange={(values) => {
          if (values.length === 0) return
          onChange(values.map(Number))
        }}
        className="w-full flex-wrap justify-center gap-2"
        spacing={2}
      >
        {newestFirst.map((year) => {
          const intensity = Math.max(0.18, year.total / peak)
          return (
            <ToggleGroupItem
              key={year.year}
              value={String(year.year)}
              className={cn(
                "h-auto min-w-[4.75rem] flex-col items-stretch gap-1.5 rounded-xl px-3 py-2",
                "data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background",
              )}
            >
              <span className="text-sm leading-none font-medium">
                {year.year}
              </span>
              <span className="text-[11px] leading-none opacity-70">
                {formatCount(year.total)}
              </span>
              <span
                className="mt-0.5 h-1 overflow-hidden rounded-full bg-current/15"
                aria-hidden="true"
              >
                <span
                  className="block h-full rounded-full bg-current"
                  style={{ width: `${Math.round(intensity * 100)}%` }}
                />
              </span>
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
    </div>
  )
}
