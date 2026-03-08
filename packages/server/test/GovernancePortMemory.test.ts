import { describe, expect, it } from "@effect/vitest"
import type { AgentId } from "@template/domain/ids"
import { Effect, Layer } from "effect"
import { GovernancePortMemory } from "../src/GovernancePortMemory.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"

describe("GovernancePortMemory", () => {
  it.effect("enforceSandbox enters sandbox context for sensitive operations", () =>
    Effect.gen(function*() {
      const governance = yield* GovernancePortMemory
      const sandboxRuntime = yield* SandboxRuntime
      const agentId = "agent:governance-memory-test" as AgentId

      const directFailure = yield* sandboxRuntime.require({
        source: "tool",
        agentId
      }).pipe(Effect.flip)
      expect(directFailure._tag).toBe("SandboxViolation")

      yield* governance.enforceSandbox(
        agentId,
        sandboxRuntime.require({
          source: "tool",
          agentId
        })
      )
    }).pipe(
      Effect.provide(
        Layer.mergeAll(
          SandboxRuntime.layer,
          GovernancePortMemory.layer.pipe(
            Layer.provide(SandboxRuntime.layer)
          )
        )
      )
    ))
})
