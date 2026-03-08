import type { Theme } from "../theme.js"

export const connectionDot = (status: string, theme: Theme): { dot: string; color: string } => {
  switch (status) {
    case "connected": return { dot: "\u25CF", color: theme.statusConnected }
    case "connecting": return { dot: "\u25CF", color: theme.statusPending }
    case "error": return { dot: "\u25CF", color: theme.statusError }
    default: return { dot: "\u25CB", color: theme.textMuted }
  }
}
