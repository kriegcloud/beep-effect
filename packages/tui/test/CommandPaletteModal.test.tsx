import { describe, expect, it } from "vitest"
import type { PaletteCommand } from "../src/components/CommandPaletteModal.js"

describe("CommandPaletteModal", () => {
  it("PaletteCommand type is constructable", () => {
    const cmd: PaletteCommand = { id: "test", label: "Test", action: () => {} }
    expect(cmd.id).toBe("test")
    expect(cmd.label).toBe("Test")
  })

  it("PaletteCommand supports optional shortcut", () => {
    const cmd: PaletteCommand = { id: "test", label: "Test", shortcut: "Ctrl+T", action: () => {} }
    expect(cmd.shortcut).toBe("Ctrl+T")
  })
})
