#!/usr/bin/env bun
import { Effect, Console, pipe, Array, Order } from "effect"
import { Terminal } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import * as Schema from "effect/Schema"
import { type PatternDefinition, PatternLevelOrder } from "../../patterns/schema"
import { HookInput, loadPatterns, findMatches } from "./core"

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal
  const input = yield* Schema.decodeUnknown(HookInput)(JSON.parse(yield* terminal.readLine))
  const patterns = yield* loadPatterns

  const matchedPatterns = findMatches(input, patterns)

  if (matchedPatterns.length === 0) return

  const context = matchedPatterns.filter(p => p.action === "context")
  const permission = matchedPatterns.filter(p => p.action !== "context")

  if (input.hook_event_name === "PostToolUse" && context.length > 0) {
    const blocks = context.map(p => {
      const tag = p.tag ?? "pattern-suggestion"
      return `<${tag}>\n${p.body}\n</${tag}>`
    })
    yield* Console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: blocks.join("\n\n")
      }
    }))
  }

  if (input.hook_event_name === "PreToolUse" && permission.length > 0) {
    const sorted = pipe(
      permission,
      Array.sort(Order.mapInput(PatternLevelOrder, (p: PatternDefinition) => p.level))
    )
    const primary = sorted[0]

    yield* Console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: primary.action,
        permissionDecisionReason: primary.body
      }
    }))
  }
})

BunRuntime.runMain(program.pipe(Effect.provide(BunContext.layer), Effect.catchAll(() => Effect.void)))
