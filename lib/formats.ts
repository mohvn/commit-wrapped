export type CardFormat = "wide" | "square" | "story"

export const CARD_FORMATS: Record<
  CardFormat,
  { label: string; width: number; height: number | null }
> = {
  wide: { label: "Wide", width: 1000, height: null },
  square: { label: "Square", width: 540, height: 540 },
  story: { label: "Stories", width: 540, height: 960 },
}

export const DEFAULT_CARD_FORMAT: CardFormat = "wide"

export function isCardFormat(value: string): value is CardFormat {
  return value in CARD_FORMATS
}
