// =============================================================================
// UI Helpers
// =============================================================================

export interface HistoryEntry {
  input: string
  output: string
  isError?: boolean
}

export const PLACEHOLDER_HINTS = ['add "Buy milk"', "list", "list --all", "toggle 1", "--help"]

export const COMMANDS = ["add", "list", "toggle", "clear"]

export const nbsp = (str: string) => str.replace(/ /g, "\u00A0")

export function getAutocomplete(input: string, cursorAtEnd: boolean): string | null {
  if (!input || !cursorAtEnd) return null
  const parts = input.split(" ")
  const first = parts[0]
  if (!first) return null
  const cmd = first.toLowerCase()

  if (parts.length === 1) {
    const match = COMMANDS.find((c) => c.startsWith(cmd) && c !== cmd)
    if (match) return match.slice(cmd.length)
  }

  if (first === "list" && parts.length === 2) {
    const flag = parts[1] ?? ""
    if ("--all".startsWith(flag) && flag !== "--all") {
      return "--all".slice(flag.length)
    }
  }

  return null
}

export function findWordBoundary(text: string, pos: number, direction: "left" | "right"): number {
  if (direction === "left") {
    if (pos === 0) return 0
    let i = pos - 1
    while (i > 0 && text[i] === " ") i--
    while (i > 0 && text[i - 1] !== " ") i--
    return i
  }
  if (pos >= text.length) return text.length
  let i = pos
  while (i < text.length && text[i] !== " ") i++
  while (i < text.length && text[i] === " ") i++
  return i
}
