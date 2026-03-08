/** Structured theme system with multiple palettes */

export interface Theme {
  // Background
  readonly bg: string
  readonly surface: string
  // Borders
  readonly border: string
  readonly borderFocus: string
  // Text
  readonly text: string
  readonly textMuted: string
  // Accent
  readonly accent: string
  // Status
  readonly error: string
  readonly streaming: string
  readonly statusConnected: string
  readonly statusError: string
  readonly statusPending: string
  // Context segments
  readonly segmentSystem: string
  readonly segmentPersona: string
  readonly segmentMemory: string
  readonly segmentHistory: string
  readonly segmentTools: string
}

export const tokyoNightDark: Theme = {
  bg: "#1a1b26",
  surface: "#24283b",
  border: "#3b4261",
  borderFocus: "#7aa2f7",
  text: "#c0caf5",
  textMuted: "#565f89",
  accent: "#7dcfff",
  error: "#f7768e",
  streaming: "#e0af68",
  statusConnected: "#9ece6a",
  statusError: "#f7768e",
  statusPending: "#e0af68",
  segmentSystem: "#7aa2f7",
  segmentPersona: "#9ece6a",
  segmentMemory: "#e0af68",
  segmentHistory: "#7dcfff",
  segmentTools: "#bb9af7"
}

export const tokyoNightLight: Theme = {
  bg: "#d5d6db",
  surface: "#c0cedb",
  border: "#9aa5ce",
  borderFocus: "#34548a",
  text: "#343b58",
  textMuted: "#9699a3",
  accent: "#166775",
  error: "#8c4351",
  streaming: "#8f5e15",
  statusConnected: "#33635c",
  statusError: "#8c4351",
  statusPending: "#8f5e15",
  segmentSystem: "#34548a",
  segmentPersona: "#33635c",
  segmentMemory: "#8f5e15",
  segmentHistory: "#166775",
  segmentTools: "#5a4a78"
}

export const catppuccinMocha: Theme = {
  bg: "#1e1e2e",
  surface: "#313244",
  border: "#45475a",
  borderFocus: "#cba6f7",
  text: "#cdd6f4",
  textMuted: "#6c7086",
  accent: "#89dceb",
  error: "#f38ba8",
  streaming: "#fab387",
  statusConnected: "#a6e3a1",
  statusError: "#f38ba8",
  statusPending: "#fab387",
  segmentSystem: "#cba6f7",
  segmentPersona: "#a6e3a1",
  segmentMemory: "#fab387",
  segmentHistory: "#89dceb",
  segmentTools: "#f5c2e7"
}

export const themes = {
  "tokyo-night": tokyoNightDark,
  "tokyo-night-light": tokyoNightLight,
  "catppuccin": catppuccinMocha
} as const

export type ThemeId = keyof typeof themes
export const defaultThemeId: ThemeId = "tokyo-night"
