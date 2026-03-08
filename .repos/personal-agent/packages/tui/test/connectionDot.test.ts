import { describe, expect, it } from "vitest"
import { connectionDot } from "../src/formatters/connectionDot.js"
import { tokyoNightDark } from "../src/theme.js"

describe("connectionDot", () => {
  const theme = tokyoNightDark

  it("connected returns filled dot with statusConnected color", () => {
    const result = connectionDot("connected", theme)
    expect(result.dot).toBe("\u25CF")
    expect(result.color).toBe(theme.statusConnected)
  })

  it("connecting returns filled dot with statusPending color", () => {
    const result = connectionDot("connecting", theme)
    expect(result.dot).toBe("\u25CF")
    expect(result.color).toBe(theme.statusPending)
  })

  it("error returns filled dot with statusError color", () => {
    const result = connectionDot("error", theme)
    expect(result.dot).toBe("\u25CF")
    expect(result.color).toBe(theme.statusError)
  })

  it("disconnected returns empty dot with textMuted color", () => {
    const result = connectionDot("disconnected", theme)
    expect(result.dot).toBe("\u25CB")
    expect(result.color).toBe(theme.textMuted)
  })

  it("unknown status returns empty dot", () => {
    const result = connectionDot("whatever", theme)
    expect(result.dot).toBe("\u25CB")
    expect(result.color).toBe(theme.textMuted)
  })
})
