import { describe, expect, it } from "@effect/vitest"
import {
  ALWAYS_ALLOWED_TOOLS,
  computeAllowedTools,
  TOOL_CATALOG,
  TOOL_CATALOG_BY_NAME,
  TOOL_NAMES_LIST,
  TOOL_SCOPE_MAP
} from "../src/ai/ToolCatalog.js"

describe("ToolCatalog", () => {
  it("has unique tool names", () => {
    const names = TOOL_CATALOG.map((e) => e.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it("has unique definitionIds", () => {
    const ids = TOOL_CATALOG.map((e) => e.definitionId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("definitionId matches tooldef:{name}:v1 format", () => {
    for (const entry of TOOL_CATALOG) {
      expect(entry.definitionId).toBe(`tooldef:${entry.name}:v1`)
    }
  })

  it("contains exactly 14 tools", () => {
    expect(TOOL_CATALOG).toHaveLength(14)
  })

  it("TOOL_NAMES_LIST matches catalog names", () => {
    expect(TOOL_NAMES_LIST).toEqual(TOOL_CATALOG.map((e) => e.name))
  })

  it("TOOL_CATALOG_BY_NAME has all entries", () => {
    expect(TOOL_CATALOG_BY_NAME.size).toBe(TOOL_CATALOG.length)
    for (const entry of TOOL_CATALOG) {
      expect(TOOL_CATALOG_BY_NAME.get(entry.name)).toBe(entry)
    }
  })

  it("ALWAYS_ALLOWED_TOOLS contains only 'always' scope group tools", () => {
    const expected = TOOL_CATALOG
      .filter((e) => e.scopeGroup === "always")
      .map((e) => e.name)
    expect([...ALWAYS_ALLOWED_TOOLS].sort()).toEqual(expected.sort())
  })

  it("TOOL_SCOPE_MAP keys cover all non-always scope groups", () => {
    const scopeKeys = Object.keys(TOOL_SCOPE_MAP)
    expect(scopeKeys.sort()).toEqual(
      ["fileRead", "fileWrite", "memoryRead", "memoryWrite", "notification", "shell"].sort()
    )
  })

  it("TOOL_SCOPE_MAP entries match catalog", () => {
    for (const [key, names] of Object.entries(TOOL_SCOPE_MAP)) {
      const expected = TOOL_CATALOG
        .filter((e) => e.scopeGroup === key)
        .map((e) => e.name)
      expect(names).toEqual(expected)
    }
  })
})

describe("computeAllowedTools", () => {
  it("returns only always-allowed tools when all scopes are false", () => {
    const result = computeAllowedTools({
      fileRead: false,
      fileWrite: false,
      shell: false,
      memoryRead: false,
      memoryWrite: false,
      notification: false
    })
    expect(result).toEqual(new Set(ALWAYS_ALLOWED_TOOLS))
  })

  it("returns all tools when all scopes are true", () => {
    const result = computeAllowedTools({
      fileRead: true,
      fileWrite: true,
      shell: true,
      memoryRead: true,
      memoryWrite: true,
      notification: true
    })
    expect(result.size).toBe(TOOL_CATALOG.length)
    for (const entry of TOOL_CATALOG) {
      expect(result.has(entry.name)).toBe(true)
    }
  })

  it("includes fileRead tools when fileRead scope is true", () => {
    const result = computeAllowedTools({
      fileRead: true,
      fileWrite: false,
      shell: false,
      memoryRead: false,
      memoryWrite: false,
      notification: false
    })
    for (const name of TOOL_SCOPE_MAP.fileRead) {
      expect(result.has(name)).toBe(true)
    }
    for (const name of TOOL_SCOPE_MAP.shell) {
      expect(result.has(name)).toBe(false)
    }
  })
})
