import { describe, expect, test } from "bun:test"
import { Effect, Scope } from "effect"
import {
  appendTranscript,
  attachExecutionOutput,
  incrementIteration,
  makeCallContext,
  readIteration,
  readTranscript
} from "../src/CallContext"
import type { SandboxInstance } from "../src/Sandbox"
import { CallId } from "../src/RlmTypes"

const makeStubSandbox = (): SandboxInstance => ({
  execute: () => Effect.succeed(""),
  setVariable: () => Effect.void,
  getVariable: () => Effect.void,
  listVariables: () => Effect.succeed([])
})

const staticSystemPromptArgs = {
  depth: 0,
  maxIterations: 10,
  maxDepth: 1
} as const

const staticSystemPromptPrefix = "static prompt prefix"

describe("CallContext", () => {
  test("makeCallContext initializes refs", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const scope = yield* Scope.make()
        const ctx = yield* makeCallContext({
          callId: CallId("c1"),
          depth: 0,
          query: "q",
          context: "ctx",
          callScope: scope,
          sandbox: makeStubSandbox(),
          staticSystemPromptArgs,
          staticSystemPromptPrefix
        })
        const iteration = yield* readIteration(ctx)
        const transcript = yield* readTranscript(ctx)
        return {
          iteration,
          transcriptLength: transcript.length,
          staticPrefix: ctx.staticSystemPromptPrefix,
          staticDepth: ctx.staticSystemPromptArgs.depth
        }
      })
    )

    expect(result.iteration).toBe(0)
    expect(result.transcriptLength).toBe(0)
    expect(result.staticPrefix).toBe(staticSystemPromptPrefix)
    expect(result.staticDepth).toBe(0)
  })

  test("transcript operations append and attach output", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const scope = yield* Scope.make()
        const ctx = yield* makeCallContext({
          callId: CallId("c2"),
          depth: 0,
          query: "q",
          context: "ctx",
          callScope: scope,
          sandbox: makeStubSandbox(),
          staticSystemPromptArgs,
          staticSystemPromptPrefix
        })

        yield* appendTranscript(ctx, "first response")
        yield* attachExecutionOutput(ctx, "out")
        const transcript = yield* readTranscript(ctx)
        return transcript
      })
    )

    expect(result).toHaveLength(1)
    expect(result[0]!.assistantResponse).toBe("first response")
    expect(result[0]!.executionOutput).toBe("out")
  })

  test("incrementIteration returns updated value", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const scope = yield* Scope.make()
        const ctx = yield* makeCallContext({
          callId: CallId("c3"),
          depth: 0,
          query: "q",
          context: "ctx",
          callScope: scope,
          sandbox: makeStubSandbox(),
          staticSystemPromptArgs,
          staticSystemPromptPrefix
        })

        const n1 = yield* incrementIteration(ctx)
        const n2 = yield* incrementIteration(ctx)
        return { n1, n2 }
      })
    )

    expect(result.n1).toBe(1)
    expect(result.n2).toBe(2)
  })
})
