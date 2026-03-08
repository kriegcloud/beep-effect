import { describe, expect, test } from "bun:test"
import { Effect, Layer } from "effect"
import { RlmConfig, type RlmConfigService } from "../src/RlmConfig"
import { SandboxError } from "../src/RlmError"
import { SchedulerQueueError } from "../src/RlmError"
import { RlmRuntimeLive } from "../src/Runtime"
import { CallId, RlmCommand } from "../src/RlmTypes"
import { enqueue } from "../src/scheduler/Queue"

const runtimeConfig: RlmConfigService = {
  maxIterations: 10,
  maxDepth: 1,
  maxLlmCalls: 20,
  maxTotalTokens: null,
  commandQueueCapacity: 2,
  concurrency: 4,
  enableLlmQueryBatched: true,
  maxBatchQueries: 32,
  eventBufferCapacity: 4096,
  maxExecutionOutputChars: 8_000,
  enablePromptCaching: true,
  primaryTarget: {
    provider: "anthropic",
    model: "claude-sonnet-4-5-20250929"
  },
  subLlmDelegation: {
    enabled: false,
    depthThreshold: 1
  }
}

describe("RlmRuntime", () => {
  test("command queue is bounded and enqueue fails fast on overload", async () => {
    const results = await Effect.runPromise(
      Effect.gen(function*() {
        yield* enqueue(RlmCommand.StartCall({
          callId: CallId("root"),
          depth: 0,
          query: "q",
          context: "ctx"
        }))
        yield* enqueue(RlmCommand.GenerateStep({
          callId: CallId("root")
        }))

        const third = yield* Effect.either(enqueue(RlmCommand.FailCall({
          callId: CallId("root"),
          error: new SandboxError({ message: "test" })
        })))

        return third
      }).pipe(
        Effect.provide(
          Layer.provide(
            RlmRuntimeLive,
            Layer.succeed(RlmConfig, runtimeConfig)
          )
        )
      )
    )

    expect(results._tag).toBe("Left")
    if (results._tag === "Left") {
      expect(results.left).toBeInstanceOf(SchedulerQueueError)
      expect(results.left.reason).toBe("overloaded")
      expect(results.left.commandTag).toBe("FailCall")
    }
  })
})
