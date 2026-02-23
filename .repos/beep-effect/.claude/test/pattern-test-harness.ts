import { describe, it, expect, beforeAll } from "vitest"
import { Effect } from "effect"
import { BunContext } from "@effect/platform-bun"
import { type PatternDefinition } from "../patterns/schema"
import { loadPatterns, findMatches, type HookInput } from "../hooks/pattern-detector/core"

let patterns: PatternDefinition[] = []

beforeAll(async () => {
  patterns = await Effect.runPromise(
    loadPatterns.pipe(Effect.provide(BunContext.layer))
  )
})

export interface PatternTestConfig {
  name: string
  tag: string | string[]
  glob?: string
  shouldMatch: string[]
  shouldNotMatch: string[]
}

export interface BashPatternTestConfig {
  name: string
  decision: "ask" | "deny"
  shouldMatch: string[]
  shouldNotMatch: string[]
}

const inferFilePathFromGlob = (glob?: string): string => {
  if (!glob) return "test.ts"
  if (glob.includes("{test,spec}") || glob.includes(".test.") || glob.includes(".spec.")) {
    return "test.test.ts"
  }
  if (glob.endsWith(".tsx") || glob.includes(".tsx")) return "test.tsx"
  if (glob.endsWith(".ts") || glob.includes(".ts")) return "test.ts"
  return "test.ts"
}

export interface WritePatternTestConfig {
  name: string
  decision: "ask" | "deny"
  shouldMatch: string[]
  shouldNotMatch: string[]
}

export const testWritePattern = (config: WritePatternTestConfig) => {
  describe(config.name, () => {
    it.each(config.shouldMatch)("should match: %s", (filePath) => {
      const input: HookInput = {
        hook_event_name: "PreToolUse",
        tool_name: "Write",
        tool_input: { file_path: filePath, content: "content" }
      }
      const matched = findMatches(input, patterns)
      const hasDecision = matched.some(p => p.action === config.decision)
      expect(hasDecision).toBe(true)
    })

    if (config.shouldNotMatch.length > 0) {
      it.each(config.shouldNotMatch)("should NOT match: %s", (filePath) => {
        const input: HookInput = {
          hook_event_name: "PreToolUse",
          tool_name: "Write",
          tool_input: { file_path: filePath, content: "content" }
        }
        const matched = findMatches(input, patterns)
        expect(matched.length).toBe(0)
      })
    }
  })
}

export interface FilePathPatternTestConfig {
  name: string
  tag: string
  shouldMatch: Array<{ code: string; filePath: string }>
  shouldNotMatch: Array<{ code: string; filePath: string }>
}

export const testFilePathPattern = (config: FilePathPatternTestConfig) => {
  describe(config.name, () => {
    it.each(config.shouldMatch)("should match: $code in $filePath", ({ code, filePath }) => {
      const input: HookInput = {
        hook_event_name: "PostToolUse",
        tool_name: "Edit",
        tool_input: { file_path: filePath, new_string: code }
      }
      const matched = findMatches(input, patterns)
      const hasTag = matched.some(p => p.tag === config.tag)
      expect(hasTag).toBe(true)
    })

    if (config.shouldNotMatch.length > 0) {
      it.each(config.shouldNotMatch)("should NOT match: $code in $filePath", ({ code, filePath }) => {
        const input: HookInput = {
          hook_event_name: "PostToolUse",
          tool_name: "Edit",
          tool_input: { file_path: filePath, new_string: code }
        }
        const matched = findMatches(input, patterns)
        const hasTag = matched.some(p => p.tag === config.tag)
        expect(hasTag).toBe(false)
      })
    }
  })
}

export const testBashPattern = (config: BashPatternTestConfig) => {
  describe(config.name, () => {
    it.each(config.shouldMatch)("should match: %s", (command) => {
      const input: HookInput = {
        hook_event_name: "PreToolUse",
        tool_name: "Bash",
        tool_input: { command }
      }
      const matched = findMatches(input, patterns)
      const hasDecision = matched.some(p => p.action === config.decision)
      expect(hasDecision).toBe(true)
    })

    if (config.shouldNotMatch.length > 0) {
      it.each(config.shouldNotMatch)("should NOT match: %s", (command) => {
        const input: HookInput = {
          hook_event_name: "PreToolUse",
          tool_name: "Bash",
          tool_input: { command }
        }
        const matched = findMatches(input, patterns)
        expect(matched.length).toBe(0)
      })
    }
  })
}

export const testPattern = (config: PatternTestConfig) => {
  const tags = Array.isArray(config.tag) ? config.tag : [config.tag]
  const filePath = inferFilePathFromGlob(config.glob)

  describe(config.name, () => {
    it.each(config.shouldMatch)("should match: %s", (code) => {
      const input: HookInput = {
        hook_event_name: "PostToolUse",
        tool_name: "Edit",
        tool_input: { file_path: filePath, new_string: code }
      }
      const matched = findMatches(input, patterns)
      const hasTag = matched.some(p => tags.includes(p.tag ?? ""))
      expect(hasTag).toBe(true)
    })

    if (config.shouldNotMatch.length > 0) {
      it.each(config.shouldNotMatch)("should NOT match: %s", (code) => {
        const input: HookInput = {
          hook_event_name: "PostToolUse",
          tool_name: "Edit",
          tool_input: { file_path: filePath, new_string: code }
        }
        const matched = findMatches(input, patterns)
        const hasTag = matched.some(p => tags.includes(p.tag ?? ""))
        expect(hasTag).toBe(false)
      })
    }
  })
}
