#!/usr/bin/env bun
/**
 * Self-Healing Hooks Entry Point
 *
 * Detects Effect pattern violations in edited files and either:
 * 1. Auto-fixes safe patterns (namespace imports, PascalCase)
 * 2. Suggests fixes for unsafe patterns (EntityIds, date types)
 *
 * CRITICAL PRINCIPLE: NEVER auto-fix anything that could change runtime behavior.
 *
 * Hook Type: PostToolUse (runs after Edit/Write operations)
 */

import * as Effect from "effect/Effect"
import * as Console from "effect/Console"
import * as Schema from "effect/Schema"
import * as Array from "effect/Array"
import { Terminal } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { PostToolUseInput } from "../schemas"
import * as SafeFixes from "./safe-fixes"
import * as Suggestions from "./suggestions"
import { isTypeScriptFile } from "./utils"
import type { FixResult } from "./types"

/**
 * Extended input schema for PostToolUse with Edit/Write response
 */
const HookInput = Schema.Union(
  PostToolUseInput,
  // Fallback for unknown event types
  Schema.Struct({
    hook_event_name: Schema.String,
  })
)

/**
 * Format fix results for output
 */
const formatResults = (
  filePath: string,
  safeResults: FixResult[],
  suggestionResults: FixResult[]
): string => {
  const lines: string[] = []

  const appliedFixes = safeResults.filter((r) => r.applied)
  const suggestions = [...safeResults.filter((r) => !r.applied), ...suggestionResults]

  if (appliedFixes.length > 0) {
    lines.push(`## Auto-Fixed (${appliedFixes.length})`)
    for (const fix of appliedFixes) {
      lines.push(`- Line ${fix.line_number ?? "?"}: ${fix.message}`)
    }
    lines.push("")
  }

  if (suggestions.length > 0) {
    lines.push(`## Suggestions (${suggestions.length})`)
    for (const suggestion of suggestions) {
      lines.push(`- Line ${suggestion.line_number ?? "?"}: ${suggestion.message}`)
      lines.push(`  Original: \`${suggestion.original}\``)
      lines.push(`  Suggested: \`${suggestion.fixed}\``)
    }
  }

  return lines.join("\n")
}

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal
  const rawInput = yield* terminal.readLine

  // Parse input
  const input = yield* Schema.decodeUnknown(HookInput)(JSON.parse(rawInput))

  // Only process PostToolUse events
  if (input.hook_event_name !== "PostToolUse") {
    return
  }

  // Type narrow to PostToolUseInput
  const postInput = input as Schema.Schema.Type<typeof PostToolUseInput>

  // Only process Edit and Write tools
  if (postInput.tool_name !== "Edit" && postInput.tool_name !== "Write") {
    return
  }

  // Get file path from tool input
  const filePath = postInput.tool_input.file_path
  if (!filePath || !isTypeScriptFile(filePath)) {
    return
  }

  // Get file content from tool response
  const response = postInput.tool_response as { newString?: string; content?: string } | undefined
  const content = response?.newString ?? response?.content
  if (!content) {
    return
  }

  // Run safe fixes (auto-applied)
  const safeFixResults = SafeFixes.detectAll(content)

  // Run suggestions (require human review)
  const suggestionResults = Suggestions.detectAll(content)

  // If no issues found, return silently
  if (safeFixResults.length === 0 && suggestionResults.length === 0) {
    return
  }

  // Format output
  const formattedOutput = formatResults(filePath, safeFixResults, suggestionResults)

  // Output as additional context
  yield* Console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `<self-healing-suggestions file="${filePath}">\n${formattedOutput}\n</self-healing-suggestions>`,
      },
    })
  )
})

BunRuntime.runMain(
  program.pipe(Effect.provide(BunContext.layer), Effect.catchAll(() => Effect.void))
)
