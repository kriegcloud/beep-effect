import { describe, expect, it } from "@effect/vitest"
import type { AgentId } from "@template/domain/ids"
import { Effect } from "effect"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"
import type { CommandInvocationContext } from "../src/tools/command/CommandTypes.js"

const sensitiveSources: ReadonlyArray<CommandInvocationContext["source"]> = [
  "tool",
  "checkpoint_replay",
  "schedule",
  "integration"
]

describe("SandboxRuntime", () => {
  it.effect("allows non-sensitive sources without active sandbox context", () =>
    Effect.gen(function*() {
      const sandboxRuntime = yield* SandboxRuntime
      yield* sandboxRuntime.require({ source: "cli" })
    }).pipe(
      Effect.provide(SandboxRuntime.layer)
    ))

  for (const source of sensitiveSources) {
    it.effect(`fails for source=${source} when context.agentId is missing`, () =>
      Effect.gen(function*() {
        const sandboxRuntime = yield* SandboxRuntime
        const error = yield* sandboxRuntime.require({
          source
        }).pipe(Effect.flip)

        expect(error._tag).toBe("SandboxViolation")
      }).pipe(
        Effect.provide(SandboxRuntime.layer)
      ))
  }

  for (const source of sensitiveSources) {
    it.effect(`fails for source=${source} without enter`, () =>
      Effect.gen(function*() {
        const sandboxRuntime = yield* SandboxRuntime
        const error = yield* sandboxRuntime.require({
          source,
          agentId: "agent:sandbox-test" as AgentId
        }).pipe(Effect.flip)

        expect(error._tag).toBe("SandboxViolation")
      }).pipe(
        Effect.provide(SandboxRuntime.layer)
      ))
  }

  for (const source of sensitiveSources) {
    it.effect(`allows source=${source} for matching entered agent`, () =>
      Effect.gen(function*() {
        const sandboxRuntime = yield* SandboxRuntime
        yield* sandboxRuntime.enter(
          "agent:sandbox-test" as AgentId,
          sandboxRuntime.require({
            source,
            agentId: "agent:sandbox-test" as AgentId
          })
        )
      }).pipe(
        Effect.provide(SandboxRuntime.layer)
      ))
  }

  it.effect("fails on agent mismatch when sandbox is entered for another agent", () =>
    Effect.gen(function*() {
      const sandboxRuntime = yield* SandboxRuntime

      const error = yield* sandboxRuntime.enter(
        "agent:entered" as AgentId,
        sandboxRuntime.require({
          source: "tool",
          agentId: "agent:requested" as AgentId
        }).pipe(Effect.flip)
      )

      expect(error._tag).toBe("SandboxViolation")
    }).pipe(
      Effect.provide(SandboxRuntime.layer)
    ))

  it.effect("restores outer agent context after nested enter exits", () =>
    Effect.gen(function*() {
      const sandboxRuntime = yield* SandboxRuntime

      yield* sandboxRuntime.enter(
        "agent:outer" as AgentId,
        Effect.gen(function*() {
          yield* sandboxRuntime.enter(
            "agent:inner" as AgentId,
            sandboxRuntime.require({
              source: "tool",
              agentId: "agent:inner" as AgentId
            })
          )

          yield* sandboxRuntime.require({
            source: "tool",
            agentId: "agent:outer" as AgentId
          })
        })
      )
    }).pipe(
      Effect.provide(SandboxRuntime.layer)
    ))
})
