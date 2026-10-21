import type { ContributionLevel } from "@/lib/types"

export type ThemeId =
  | "mono"
  | "forest"
  | "ocean"
  | "violet"
  | "ember"
  | "rose"
  | "gold"
  | "crimson"
  | "teal"
  | "indigo"
  | "lime"
  | "nord"
  | "halloween"

export type WrappedTheme = {
  id: ThemeId
  name: string
  background: string
  base: string
  text: string
  muted: string
  dim: string
  year: string
  border: string
  levels: Record<ContributionLevel, string>
}

export const THEMES: WrappedTheme[] = [
  {
    id: "mono",
    name: "Mono",
    background:
      "radial-gradient(ellipse 70% 90% at 100% 0%, #1f1f1f 0%, transparent 55%), #0b0b0b",
    base: "#0b0b0b",
    text: "#fafafa",
    muted: "#8a8a8a",
    dim: "#6b6b6b",
    year: "#d4d4d4",
    border: "rgba(255,255,255,0.06)",
    levels: {
      0: "#1c1c1c",
      1: "#3d3d3d",
      2: "#6e6e6e",
      3: "#a3a3a3",
      4: "#ececec",
    },
  },
  {
    id: "forest",
    name: "Forest",
    background:
      "radial-gradient(ellipse 70% 90% at 100% 0%, #123524 0%, transparent 55%), #0b0b0b",
    base: "#0b0b0b",
    text: "#fafafa",
    muted: "#8a8a8a",
    dim: "#6b6b6b",
    year: "#86efac",
    border: "rgba(34,197,94,0.18)",
    levels: {
      0: "#1c1c1c",
      1: "#0e4429",
      2: "#006d32",
      3: "#26a641",
      4: "#39d353",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    background:
      "radial-gradient(ellipse 70% 90% at 100% 0%, #0f2a40 0%, transparent 55%), #0b0b0b",
    base: "#0b0b0b",
    text: "#fafafa",
    muted: "#8a8a8a",
    dim: "#6b6b6b",
    year: "#7dd3fc",
    border: "rgba(14,165,233,0.18)",
    levels: {
      0: "#1c1c1c",
      1: "#0c4a6e",
      2: "#0369a1",
      3: "#0ea5e9",
      4: "#7dd3fc",
    },
  },
  {
    id: "violet",
    name: "Violet",
    background:
      "radial-gradient(ellipse 70% 90% at 100% 0%, #24143a 0%, transparent 55%), #0b0b0b",
    base: "#0b0b0b",
    text: "#fafafa",
    muted: "#8a8a8a",
    dim: "#6b6b6b",
    year: "#c4b5fd",
    border: "rgba(139,92,246,0.2)",
    levels: {
      0: "#1c1c1c",
      1: "#3b0764",
      2: "#6d28d9",
      3: "#a78bfa",
      4: "#ddd6fe",
    },
  },
  {
    id: "ember",
    name: "Ember",
    background:
      "radial-gradient(ellipse 70% 90% at 100% 0%, #3a1608 0%, transparent 55%), #0b0b0b",
    base: "#0b0b0b",
    text: "#fafafa",
    muted: "#8a8a8a",
    dim: "#6b6b6b",
    year: "#fdba74",
    border: "rgba(249,115,22,0.2)",
    levels: {
      0: "#1c1c1c",
      1: "#7c2d12",
      2: "#c2410c",
      3: "#fb923c",
      4: "#fed7aa",
    },
  },
  {
    id: "rose",
    name: "Rose",
    background:
      "radial-gradient(ellipse 70% 90% at 100% 0%, #3a1020 0%, transparent 55%), #0b0b0b",
    base: "#0b0b0b",
    text: "#fafafa",
    muted: "#8a8a8a",
    dim: "#6b6b6b",
    year: "#f9a8d4",
    border: "rgba(236,72,153,0.2)",
    levels: {
      0: "#1c1c1c",
      1: "#9d174d",
      2: "#db2777",
      3: "#f472b6",
      4: "#fbcfe8",
    },
  },
  {
    id: "gold",
    name: "Gold",
    background:
      "radial-gradient(ellipse 70% 90% at 100% 0%, #332408 0%, transparent 55%), #0b0b0b",
    base: "#0b0b0b",
    text: "#fafafa",
    muted: "#8a8a8a",
    dim: "#6b6b6b",
    year: "#fde68a",
    border: "rgba(234,179,8,0.2)",
    levels: {
      0: "#1c1c1c",
      1: "#713f12",
      2: "#ca8a04",
      3: "#facc15",
      4: "#fef08a",
    },
  },
  {
    id: "crimson",
    name: "Crimson",
    background:
      "radial-gradient(ellipse 70% 90% at 100% 0%, #3a1010 0%, transparent 55%), #0b0b0b",
    base: "#0b0b0b",
    text: "#fafafa",
    muted: "#8a8a8a",
    dim: "#6b6b6b",
    year: "#fca5a5",
    border: "rgba(239,68,68,0.2)",
    levels: {
      0: "#1c1c1c",
      1: "#7f1d1d",
      2: "#b91c1c",
      3: "#f87171",
      4: "#fecaca",
    },
  },
  {
    id: "teal",
    name: "Teal",
    background:
      "radial-gradient(ellipse 70% 90% at 100% 0%, #0d2e2b 0%, transparent 55%), #0b0b0b",
    base: "#0b0b0b",
    text: "#fafafa",
    muted: "#8a8a8a",
    dim: "#6b6b6b",
    year: "#5eead4",
    border: "rgba(20,184,166,0.2)",
    levels: {
      0: "#1c1c1c",
      1: "#134e4a",
      2: "#0f766e",
      3: "#2dd4bf",
      4: "#99f6e4",
    },
  },
  {
    id: "indigo",
    name: "Indigo",
    background:
      "radial-gradient(ellipse 70% 90% at 100% 0%, #1a1840 0%, transparent 55%), #0b0b0b",
    base: "#0b0b0b",
    text: "#fafafa",
    muted: "#8a8a8a",
    dim: "#6b6b6b",
    year: "#a5b4fc",
    border: "rgba(99,102,241,0.2)",
    levels: {
      0: "#1c1c1c",
      1: "#312e81",
      2: "#4338ca",
      3: "#818cf8",
      4: "#c7d2fe",
    },
  },
  {
    id: "lime",
    name: "Lime",
    background:
      "radial-gradient(ellipse 70% 90% at 100% 0%, #1f2e0a 0%, transparent 55%), #0b0b0b",
    base: "#0b0b0b",
    text: "#fafafa",
    muted: "#8a8a8a",
    dim: "#6b6b6b",
    year: "#bef264",
    border: "rgba(132,204,22,0.2)",
    levels: {
      0: "#1c1c1c",
      1: "#3f6212",
      2: "#65a30d",
      3: "#a3e635",
      4: "#d9f99d",
    },
  },
  {
    id: "nord",
    name: "Nord",
    background:
      "radial-gradient(ellipse 70% 90% at 100% 0%, #1c2430 0%, transparent 55%), #0b0b0b",
    base: "#0b0b0b",
    text: "#fafafa",
    muted: "#8a8a8a",
    dim: "#6b6b6b",
    year: "#88c0d0",
    border: "rgba(136,192,208,0.2)",
    levels: {
      0: "#1c1c1c",
      1: "#3b4252",
      2: "#5e81ac",
      3: "#88c0d0",
      4: "#eceff4",
    },
  },
  {
    id: "halloween",
    name: "Halloween",
    background:
      "radial-gradient(ellipse 70% 90% at 100% 0%, #2a1408 0%, transparent 55%), #0b0b0b",
    base: "#0b0b0b",
    text: "#fafafa",
    muted: "#8a8a8a",
    dim: "#6b6b6b",
    year: "#fddf68",
    border: "rgba(250,122,24,0.22)",
    levels: {
      0: "#1c1c1c",
      1: "#631c03",
      2: "#bd561d",
      3: "#fa7a18",
      4: "#fddf68",
    },
  },
]

export const DEFAULT_THEME_ID: ThemeId = "mono"

export function getTheme(id: string | null | undefined): WrappedTheme {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0]
}

export function isThemeId(value: string): value is ThemeId {
  return THEMES.some((theme) => theme.id === value)
}
