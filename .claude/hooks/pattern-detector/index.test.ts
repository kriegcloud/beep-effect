import { describe, it, expect } from "vitest"
import { Effect, Array, Option, Order, pipe } from "effect"
import picomatch from "picomatch"
import * as TestClaude from "../../test/TestClaude"
import type { PatternDefinition } from "../../patterns/schema"
import { PatternLevelOrder } from "../../patterns/schema"

const contentFields = ["command", "new_string", "content", "pattern", "query", "url", "prompt"] as const

const getMatchableContent = (input: Record<string, unknown>): string =>
  pipe(
    contentFields,
    Array.findFirst((field) => typeof input[field] === "string"),
    Option.flatMap((field) => Option.fromNullable(input[field] as string)),
    Option.getOrElse(() => JSON.stringify(input)),
  )

const getFilePath = (input: Record<string, unknown>): Option.Option<string> =>
  pipe(
    Option.fromNullable(input.file_path),
    Option.filter((v): v is string => typeof v === "string"),
  )

const testRegex = (text: string, pattern: string): boolean => {
  try { return new globalThis.RegExp(pattern).test(text) } catch { return false }
}

const testGlob = (filePath: string, glob: string): boolean => {
  try { return picomatch(glob)(filePath) } catch { return false }
}

const matches = (input: TestClaude.HookInput, p: PatternDefinition): boolean => {
  const filePath = pipe(getFilePath(input.tool_input as Record<string, unknown>), Option.getOrUndefined)
  const content = getMatchableContent(input.tool_input as Record<string, unknown>)

  return (
    p.event === input.hook_event_name &&
    testRegex(input.tool_name, p.tool) &&
    (!p.glob || !filePath || testGlob(filePath, p.glob)) &&
    testRegex(content, p.pattern)
  )
}

const processPatterns = (input: TestClaude.HookInput, patterns: PatternDefinition[]): TestClaude.HookOutput | null => {
  const matchedPatterns = patterns.filter(p => matches(input, p))

  if (matchedPatterns.length === 0) return null

  const context = matchedPatterns.filter(p => p.action === "context")
  const permission = matchedPatterns.filter(p => p.action !== "context")

  if (input.hook_event_name === "PostToolUse" && context.length > 0) {
    const blocks = context.map(p => {
      const tag = p.tag ?? "pattern-suggestion"
      return `<${tag}>\n${p.body}\n</${tag}>`
    })
    return {
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `<pattern-suggestions>\n${blocks.join("\n\n")}\n</pattern-suggestions>`
      }
    }
  }

  if (input.hook_event_name === "PreToolUse" && permission.length > 0) {
    const sorted = pipe(
      permission,
      Array.sort(Order.mapInput(PatternLevelOrder, (p: PatternDefinition) => p.level))
    )
    const primary = sorted[0]

    return {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: primary.action,
        permissionDecisionReason: primary.body
      }
    }
  }

  return null
}

const createPattern = (overrides: Partial<PatternDefinition>): PatternDefinition => ({
  name: "test-pattern",
  description: "Test pattern",
  event: "PostToolUse",
  tool: ".*",
  pattern: ".*",
  action: "context",
  level: "info",
  body: "Test body",
  filePath: "/test/pattern.md",
  ...overrides,
})

describe("Pattern Detector", () => {
  describe("content extraction", () => {
    it("extracts command from Bash tool", () => {
      const input = { command: "rm -rf /" }
      expect(getMatchableContent(input)).toBe("rm -rf /")
    })

    it("extracts new_string from Edit tool", () => {
      const input = { file_path: "/test.ts", old_string: "a", new_string: "console.log(x)" }
      expect(getMatchableContent(input)).toBe("console.log(x)")
    })

    it("extracts content from Write tool", () => {
      const input = { file_path: "/test.ts", content: "const x = 1" }
      expect(getMatchableContent(input)).toBe("const x = 1")
    })

    it("extracts pattern from Grep tool", () => {
      const input = { pattern: "TODO|FIXME" }
      expect(getMatchableContent(input)).toBe("TODO|FIXME")
    })

    it("extracts query from WebSearch tool", () => {
      const input = { query: "Effect TypeScript" }
      expect(getMatchableContent(input)).toBe("Effect TypeScript")
    })

    it("extracts url from WebFetch tool", () => {
      const input = { url: "https://api.example.com" }
      expect(getMatchableContent(input)).toBe("https://api.example.com")
    })

    it("extracts prompt from Task tool", () => {
      const input = { description: "Test", prompt: "Do something", subagent_type: "worker" }
      expect(getMatchableContent(input)).toBe("Do something")
    })

    it("falls back to JSON when no known fields", () => {
      const input = { unknown: "value" }
      expect(getMatchableContent(input)).toBe(JSON.stringify(input))
    })
  })

  describe("file path extraction", () => {
    it("extracts file_path when present", () => {
      const input = { file_path: "/test/file.ts" }
      expect(Option.getOrUndefined(getFilePath(input))).toBe("/test/file.ts")
    })

    it("returns None when file_path is missing", () => {
      const input = { command: "echo hello" }
      expect(Option.isNone(getFilePath(input))).toBe(true)
    })

    it("returns None when file_path is not a string", () => {
      const input = { file_path: 123 }
      expect(Option.isNone(getFilePath(input))).toBe(true)
    })
  })

  describe("regex matching", () => {
    it("matches simple patterns", () => {
      expect(testRegex("rm -rf /", "rm -rf")).toBe(true)
      expect(testRegex("rm -rf /", "^rm")).toBe(true)
      expect(testRegex("hello world", "world$")).toBe(true)
    })

    it("returns false for non-matching patterns", () => {
      expect(testRegex("hello", "goodbye")).toBe(false)
    })

    it("handles invalid regex gracefully", () => {
      expect(testRegex("test", "[invalid")).toBe(false)
    })
  })

  describe("glob matching", () => {
    it("matches simple wildcards", () => {
      expect(testGlob("file.ts", "*.ts")).toBe(true)
      expect(testGlob("dir/file.ts", "*.ts")).toBe(false)
      expect(testGlob("file.js", "*.ts")).toBe(false)
    })

    it("matches double star wildcards", () => {
      expect(testGlob("file.ts", "**/*.ts")).toBe(true)
      expect(testGlob("dir/file.ts", "**/*.ts")).toBe(true)
      expect(testGlob("dir/sub/file.ts", "**/*.ts")).toBe(true)
    })

    it("matches brace expansions", () => {
      expect(testGlob("file.ts", "*.{ts,tsx}")).toBe(true)
      expect(testGlob("file.tsx", "*.{ts,tsx}")).toBe(true)
      expect(testGlob("file.js", "*.{ts,tsx}")).toBe(false)
    })

    it("matches exact paths", () => {
      expect(testGlob("test.ts", "test.ts")).toBe(true)
      expect(testGlob("testXts", "test.ts")).toBe(false)
    })
  })

  describe("pattern matching", () => {
    it("matches tool name", () => {
      const pattern = createPattern({ tool: "Bash", pattern: ".*" })
      const input = TestClaude.Bash({ command: "echo hello" }).pre

      expect(matches(input, pattern)).toBe(false)
    })

    it("matches tool name with regex", () => {
      const pattern = createPattern({ tool: "Bash", event: "PreToolUse", pattern: ".*" })
      const input = TestClaude.Bash({ command: "echo hello" }).pre

      expect(matches(input, pattern)).toBe(true)
    })

    it("matches command content", () => {
      const pattern = createPattern({
        tool: "Bash",
        event: "PreToolUse",
        pattern: "rm -rf"
      })
      const input = TestClaude.Bash({ command: "rm -rf /" }).pre

      expect(matches(input, pattern)).toBe(true)
    })

    it("does not match when pattern fails", () => {
      const pattern = createPattern({
        tool: "Bash",
        event: "PreToolUse",
        pattern: "DROP TABLE"
      })
      const input = TestClaude.Bash({ command: "echo hello" }).pre

      expect(matches(input, pattern)).toBe(false)
    })

    it("matches file glob patterns", () => {
      const pattern = createPattern({
        tool: "Edit",
        event: "PreToolUse",
        glob: "**/*.test.ts",
        pattern: ".*"
      })
      const input = TestClaude.Edit({
        file_path: "/src/components/Button.test.ts",
        old_string: "a",
        new_string: "b"
      }).pre

      expect(matches(input, pattern)).toBe(true)
    })

    it("does not match when glob fails", () => {
      const pattern = createPattern({
        tool: "Edit",
        event: "PreToolUse",
        glob: "**/*.test.ts",
        pattern: ".*"
      })
      const input = TestClaude.Edit({
        file_path: "/src/components/Button.ts",
        old_string: "a",
        new_string: "b"
      }).pre

      expect(matches(input, pattern)).toBe(false)
    })

    it("matches event type", () => {
      const pattern = createPattern({ event: "PostToolUse", tool: "Bash", pattern: ".*" })
      const preInput = TestClaude.Bash({ command: "echo hello" }).pre
      const postInput = TestClaude.Bash({ command: "echo hello" }).post

      expect(matches(preInput, pattern)).toBe(false)
      expect(matches(postInput, pattern)).toBe(true)
    })
  })

  describe("permission decisions (PreToolUse)", () => {
    it("returns ask decision for dangerous commands", () => {
      const pattern = createPattern({
        event: "PreToolUse",
        tool: "Bash",
        pattern: "rm -rf",
        action: "ask",
        level: "critical",
        body: "This will delete files permanently"
      })
      const input = TestClaude.Bash({ command: "rm -rf /" }).pre

      const output = processPatterns(input, [pattern])

      expect(TestClaude.isAsk(output)).toBe(true)
      expect(TestClaude.reason(output)).toBe("This will delete files permanently")
    })

    it("returns deny decision for blocked operations", () => {
      const pattern = createPattern({
        event: "PreToolUse",
        tool: "Bash",
        pattern: "DROP DATABASE",
        action: "deny",
        level: "critical",
        body: "Database deletion is not allowed"
      })
      const input = TestClaude.Bash({ command: "DROP DATABASE production" }).pre

      const output = processPatterns(input, [pattern])

      expect(TestClaude.isDeny(output)).toBe(true)
      expect(TestClaude.reason(output)).toBe("Database deletion is not allowed")
    })

    it("prioritizes by severity level", () => {
      const patterns = [
        createPattern({
          event: "PreToolUse",
          tool: "Bash",
          pattern: "rm",
          action: "ask",
          level: "medium",
          body: "Medium priority"
        }),
        createPattern({
          event: "PreToolUse",
          tool: "Bash",
          pattern: "rm",
          action: "deny",
          level: "critical",
          body: "Critical priority"
        }),
        createPattern({
          event: "PreToolUse",
          tool: "Bash",
          pattern: "rm",
          action: "ask",
          level: "high",
          body: "High priority"
        }),
      ]
      const input = TestClaude.Bash({ command: "rm file.txt" }).pre

      const output = processPatterns(input, patterns)

      expect(TestClaude.reason(output)).toBe("Critical priority")
    })

    it("returns null when no patterns match", () => {
      const pattern = createPattern({
        event: "PreToolUse",
        tool: "Bash",
        pattern: "DROP TABLE",
        action: "ask",
      })
      const input = TestClaude.Bash({ command: "echo hello" }).pre

      const output = processPatterns(input, [pattern])

      expect(output).toBe(null)
    })

    it("ignores context patterns on PreToolUse", () => {
      const pattern = createPattern({
        event: "PreToolUse",
        tool: "Bash",
        pattern: ".*",
        action: "context",
        body: "Some context"
      })
      const input = TestClaude.Bash({ command: "echo hello" }).pre

      const output = processPatterns(input, [pattern])

      expect(output).toBe(null)
    })
  })

  describe("context suggestions (PostToolUse)", () => {
    it("provides context suggestions after tool use", () => {
      const pattern = createPattern({
        event: "PostToolUse",
        tool: "Edit",
        pattern: "console\\.log",
        action: "context",
        body: "Consider using Effect.log instead",
        tag: "code-quality"
      })
      const input = TestClaude.Edit({
        file_path: "/test.ts",
        old_string: "a",
        new_string: "console.log(x)"
      }).post

      const output = processPatterns(input, [pattern])

      expect(TestClaude.context(output)).toContain("Consider using Effect.log instead")
      expect(TestClaude.context(output)).toContain("<code-quality>")
    })

    it("uses default pattern-suggestion tag when not specified", () => {
      const pattern = createPattern({
        event: "PostToolUse",
        tool: "Edit",
        pattern: ".*",
        action: "context",
        body: "Some suggestion"
      })
      const input = TestClaude.Edit({
        file_path: "/test.ts",
        old_string: "a",
        new_string: "b"
      }).post

      const output = processPatterns(input, [pattern])

      expect(TestClaude.context(output)).toContain("<pattern-suggestion>")
    })

    it("combines multiple context patterns", () => {
      const patterns = [
        createPattern({
          event: "PostToolUse",
          tool: "Edit",
          pattern: "console\\.log",
          action: "context",
          body: "Use Effect.log",
          tag: "logging"
        }),
        createPattern({
          event: "PostToolUse",
          tool: "Edit",
          pattern: "console\\.log",
          action: "context",
          body: "Consider debug levels",
          tag: "debugging"
        })
      ]
      const input = TestClaude.Edit({
        file_path: "/test.ts",
        old_string: "a",
        new_string: "console.log(x)"
      }).post

      const output = processPatterns(input, patterns)
      const ctx = TestClaude.context(output)

      expect(ctx).toContain("Use Effect.log")
      expect(ctx).toContain("Consider debug levels")
      expect(ctx).toContain("<logging>")
      expect(ctx).toContain("<debugging>")
    })

    it("ignores permission patterns on PostToolUse", () => {
      const pattern = createPattern({
        event: "PostToolUse",
        tool: "Bash",
        pattern: ".*",
        action: "ask",
      })
      const input = TestClaude.Bash({ command: "echo hello" }).post

      const output = processPatterns(input, [pattern])

      expect(output).toBe(null)
    })
  })

  describe("real-world scenarios", () => {
    it("detects dangerous rm commands", () => {
      const pattern = createPattern({
        event: "PreToolUse",
        tool: "Bash",
        pattern: "rm\\s+(-[rf]+\\s+)?/",
        action: "ask",
        level: "critical",
        body: "You are about to delete files from the root directory"
      })

      const dangerous = [
        "rm -rf /",
        "rm -rf /usr",
        "rm -r /home",
      ]

      const safe = [
        "rm file.txt",
        "rm -rf ./node_modules",
      ]

      dangerous.forEach(cmd => {
        const input = TestClaude.Bash({ command: cmd }).pre
        const output = processPatterns(input, [pattern])
        expect(TestClaude.isAsk(output)).toBe(true)
      })

      safe.forEach(cmd => {
        const input = TestClaude.Bash({ command: cmd }).pre
        const output = processPatterns(input, [pattern])
        expect(output).toBe(null)
      })
    })

    it("detects console.log in code edits", () => {
      const pattern = createPattern({
        event: "PostToolUse",
        tool: "Edit",
        pattern: "console\\.(log|warn|error)",
        action: "context",
        body: "Consider using Effect logging: Effect.log, Effect.logWarning, Effect.logError",
        tag: "effect-patterns"
      })

      const input = TestClaude.Edit({
        file_path: "/src/index.ts",
        old_string: "const x = 1",
        new_string: "const x = 1\nconsole.log(x)"
      }).post

      const output = processPatterns(input, [pattern])

      expect(TestClaude.context(output)).toContain("Effect logging")
    })

    it("detects secrets exposure", () => {
      const pattern = createPattern({
        event: "PreToolUse",
        tool: "Bash",
        pattern: "(cat|echo|printf)\\s+.*\\.(env|pem|key)",
        action: "ask",
        level: "high",
        body: "This command may expose sensitive credentials"
      })

      const input = TestClaude.Bash({ command: "cat .env" }).pre
      const output = processPatterns(input, [pattern])

      expect(TestClaude.isAsk(output)).toBe(true)
      expect(TestClaude.reason(output)).toContain("credentials")
    })

    it("matches Edit tool operations on test files", () => {
      const pattern = createPattern({
        event: "PostToolUse",
        tool: "Edit",
        glob: "**/*.test.ts",
        pattern: "expect",
        action: "context",
        body: "For Effect tests, use assert from @effect/vitest instead of expect",
        tag: "testing"
      })

      const testFileInput = TestClaude.Edit({
        file_path: "/src/Component.test.ts",
        old_string: "a",
        new_string: "expect(result).toBe(true)"
      }).post

      const regularFileInput = TestClaude.Edit({
        file_path: "/src/Component.ts",
        old_string: "a",
        new_string: "expect(result).toBe(true)"
      }).post

      expect(processPatterns(testFileInput, [pattern])).not.toBe(null)
      expect(processPatterns(regularFileInput, [pattern])).toBe(null)
    })
  })
})
