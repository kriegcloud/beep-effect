import { describe, expect, it } from "vitest"
import { themes, defaultThemeId, type Theme } from "../src/theme.js"

const themeKeys: ReadonlyArray<keyof Theme> = [
  "bg", "surface", "border", "borderFocus",
  "text", "textMuted", "accent",
  "error", "streaming", "statusConnected", "statusError", "statusPending",
  "segmentSystem", "segmentPersona", "segmentMemory", "segmentHistory", "segmentTools"
]

describe("Theme system", () => {
  it("themes map has expected keys", () => {
    expect(Object.keys(themes)).toEqual(["tokyo-night", "tokyo-night-light", "catppuccin"])
  })

  it("defaultThemeId exists in themes", () => {
    expect(themes[defaultThemeId]).toBeDefined()
  })

  for (const [id, theme] of Object.entries(themes)) {
    describe(`theme: ${id}`, () => {
      it("has all required keys", () => {
        for (const key of themeKeys) {
          expect(theme).toHaveProperty(key)
        }
      })

      it("all values are hex color strings", () => {
        for (const key of themeKeys) {
          const value = theme[key]
          expect(typeof value).toBe("string")
          expect(value).toMatch(/^#[0-9a-fA-F]{6}$/)
        }
      })
    })
  }
})
