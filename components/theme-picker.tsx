"use client"

import { motion } from "motion/react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { THEMES, type ThemeId, type WrappedTheme } from "@/lib/themes"

export function Swatch({ theme }: { theme: WrappedTheme }) {
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {([1, 2, 3, 4] as const).map((level) => (
        <span
          key={level}
          className="size-2.5 rounded-[3px]"
          style={{ backgroundColor: theme.levels[level] }}
        />
      ))}
    </span>
  )
}

export function ThemePicker({
  value,
  onChange,
}: {
  value: ThemeId
  onChange: (id: ThemeId) => void
}) {
  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-2">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Theme
      </p>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={value}
        onValueChange={(next) => {
          if (!next) return
          onChange(next as ThemeId)
        }}
        className="w-full flex-wrap justify-center"
      >
        {THEMES.map((theme) => (
          <ToggleGroupItem
            key={theme.id}
            value={theme.id}
            aria-label={theme.name}
            className="relative h-auto flex-col gap-1.5 rounded-xl px-2.5 py-2"
          >
            {value === theme.id ? (
              <motion.span
                layoutId="theme-ring"
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{ outline: `2px solid ${theme.levels[3]}` }}
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  visualDuration: 0.35,
                }}
              />
            ) : null}
            <Swatch theme={theme} />
            <span className="text-[11px] leading-none">{theme.name}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
