import { describe, expect, test } from "bun:test"
import { Chunk, Effect, Exit, Fiber, Layer, Queue, Ref, Schema, Stream } from "effect"
import { complete, completeWithOutcome, stream } from "../src/Rlm"
import { LlmCallLive } from "../src/LlmCall"
import { RlmConfig, type RlmConfigService } from "../src/RlmConfig"
import { BudgetExhaustedError, OutputValidationError } from "../src/RlmError"
import { RlmRuntime, RlmRuntimeLive } from "../src/Runtime"
import { RlmCommand, CallId } from "../src/RlmTypes"
import { SandboxFactory } from "../src/Sandbox"
import { BridgeStoreLive } from "../src/scheduler/BridgeStore"
import { makeFakeRlmModelLayer, type FakeModelMetrics, type FakeModelResponse } from "./helpers/FakeRlmModel"
import { makeFakeSandboxFactoryLayer, type FakeSandboxMetrics } from "./helpers/FakeSandboxFactory"

const defaultConfig: RlmConfigService = {
  maxIterations: 10,
  maxDepth: 1,
  maxLlmCalls: 20,
  maxTotalTokens: null,
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

const makeLayers = (options: {
  readonly responses: ReadonlyArray<FakeModelResponse>
  readonly modelMetrics?: FakeModelMetrics
  readonly sandboxMetrics?: FakeSandboxMetrics
  readonly config?: Partial<RlmConfigService>
}) => {
  const model = makeFakeRlmModelLayer(options.responses, options.modelMetrics)
  const sandbox = makeFakeSandboxFactoryLayer(options.sandboxMetrics)
  const runtimeWithBridgeStore = Layer.fresh(Layer.merge(
    RlmRuntimeLive,
    Layer.provide(BridgeStoreLive, RlmRuntimeLive)
  ))
  const core = Layer.mergeAll(model, sandbox, runtimeWithBridgeStore)
  const llmCallLayer = Layer.provideMerge(LlmCallLive, core)
  const base = Layer.merge(core, llmCallLayer)
  const configLayer = Layer.succeed(RlmConfig, { ...defaultConfig, ...options.config })
  return Layer.provideMerge(base, configLayer)
}

const submitAnswer = (answer: string, totalTokens?: number): FakeModelResponse => ({
  ...(totalTokens !== undefined ? { totalTokens } : {}),
  toolCalls: [{ name: "SUBMIT", params: { answer } }]
})

const submitValue = (value: unknown): FakeModelResponse => ({
  toolCalls: [{ name: "SUBMIT", params: { value } }]
})

describe("Rlm thin slice", () => {
  test("returns final answer from scripted model", async () => {
    const modelMetrics: FakeModelMetrics = { calls: 0, prompts: [], depths: [] }
    const sandboxMetrics: FakeSandboxMetrics = {
      createCalls: 0,
      executeCalls: 0,
      snippets: []
    }

    const answer = await Effect.runPromise(
      complete({
        query: "What is 2+2?",
        context: "2+2=4"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [submitAnswer("4", 12)],
            modelMetrics,
            sandboxMetrics
          })
        )
      )
    )

    expect(answer._tag).toBe("Right")
    if (answer._tag === "Right") {
      expect(answer.right).toBe("4")
    }
    expect(modelMetrics.calls).toBe(1)
    expect(sandboxMetrics.createCalls).toBe(1)
  })

  test("returns final answer from SUBMIT tool call", async () => {
    const result = await Effect.runPromise(
      complete({
        query: "What is 2+2?",
        context: "2+2=4"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [{
              text: "Submitting answer",
              toolCalls: [{
                name: "SUBMIT",
                params: { answer: "4" }
              }]
            }]
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("4")
    }
  })

  test("plain-output mode recovers from invalid SUBMIT value payloads", async () => {
    const result = await Effect.runPromise(
      complete({
        query: "return bigint",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              {
                toolCalls: [{
                  name: "SUBMIT",
                  params: { value: 10n }
                }]
              },
              submitAnswer("corrected answer")
            ]
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("corrected answer")
    }
  })

  test("reserves llm budget before model invocation", async () => {
    const modelMetrics: FakeModelMetrics = { calls: 0, prompts: [], depths: [] }

    const result = await Effect.runPromise(
      complete({
        query: "Will not run",
        context: "budget gate"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [submitAnswer("unreachable")],
            modelMetrics,
            config: {
              maxIterations: 2,
              maxLlmCalls: 0
            }
          })
        )
      )
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(BudgetExhaustedError)
    }
    expect(modelMetrics.calls).toBe(0)
  })

  test("emits deterministic event sequence for identical scripts", async () => {
    const runOnce = async () => {
      const events = await Effect.runPromise(
        stream({
          query: "summarize",
          context: "A B C"
        }).pipe(
          Stream.runCollect,
          Effect.provide(
            makeLayers({
              responses: [
                { text: "I will inspect first." },
                submitAnswer("done")
              ]
            })
          )
        )
      )

      return Chunk.toReadonlyArray(events).map((event) => {
        switch (event._tag) {
          case "IterationStarted":
            return `${event._tag}:${event.iteration}`
          case "ModelResponse":
            return `${event._tag}:${event.text}`
          case "CallFinalized":
            return `${event._tag}:${event.answer}`
          case "CallFailed":
            return `${event._tag}:${event.error._tag}`
          default:
            return event._tag
        }
      })
    }

    const first = await runOnce()
    const second = await runOnce()

    expect(first).toEqual(second)
  })

  test("completeWithOutcome returns Partial when extraction cannot finalize", async () => {
    const outcome = await Effect.runPromise(
      completeWithOutcome({
        query: "No finalize",
        context: "ctx"
      }).pipe(
        Effect.provide(
          makeLayers({
            responses: [
              { text: "thinking..." },
              { text: "still no submit" }
            ],
            config: { maxIterations: 1 }
          })
        )
      )
    )

    expect(outcome._tag).toBe("Partial")
    if (outcome._tag === "Partial") {
      expect(outcome.payload.reason).toBe("iterations")
      expect(outcome.payload.transcript.length).toBeGreaterThan(0)
    }
  })

  test("stream cancellation interrupts scheduler and cleans up runtime state", async () => {
    const hangingSandboxLayer = Layer.succeed(
      SandboxFactory,
      SandboxFactory.of({
        create: () =>
          Effect.succeed({
            execute: () => Effect.never,
            setVariable: () => Effect.void,
            getVariable: () => Effect.void,
            listVariables: () => Effect.succeed([])
          })
      })
    )

    const runtimeWithBridgeStore = Layer.fresh(Layer.merge(
      RlmRuntimeLive,
      Layer.provide(BridgeStoreLive, RlmRuntimeLive)
    ))
    const core = Layer.mergeAll(
      makeFakeRlmModelLayer([{ text: "```js\nhang()\n```" }]),
      hangingSandboxLayer,
      runtimeWithBridgeStore
    )
    const llmCallLayer = Layer.provideMerge(LlmCallLive, core)
    const layers = Layer.provideMerge(
      Layer.merge(core, llmCallLayer),
      Layer.succeed(RlmConfig, defaultConfig)
    )

    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const runtime = yield* RlmRuntime

        const streamFiber = yield* stream({
          query: "cancel me",
          context: "ctx"
        }).pipe(
          Stream.runForEach(() => Effect.void),
          Effect.fork
        )

        yield* Effect.sleep("100 millis")
        yield* Fiber.interrupt(streamFiber)
        const streamExit = yield* Fiber.await(streamFiber)

        const statesAfter = yield* Ref.get(runtime.callStates)
        const bridgeAfter = yield* Ref.get(runtime.bridgePending)
        const offerAfterShutdown = yield* Effect.exit(
          Queue.offer(runtime.commands, RlmCommand.GenerateStep({ callId: CallId("after-cancel") }))
        )

        return {
          streamExit,
          remainingStates: statesAfter.size,
          remainingBridge: bridgeAfter.size,
          offerAfterShutdown
        }
      }).pipe(
        Effect.provide(layers),
        Effect.timeout("3 seconds")
      )
    )

    expect(Exit.isFailure(result.streamExit)).toBe(true)
    expect(result.remainingStates).toBe(0)
    expect(result.remainingBridge).toBe(0)
    expect(Exit.isFailure(result.offerAfterShutdown)).toBe(true)
  })
})

describe("Rlm typed output", () => {
  test("complete with outputSchema accepts SUBMIT value payload", async () => {
    const ResultSchema = Schema.Struct({
      answer: Schema.Number,
      unit: Schema.String
    })

    const result = await Effect.runPromise(
      complete({
        query: "What is 2+2?",
        context: "math",
        outputSchema: ResultSchema
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [{
              toolCalls: [{
                name: "SUBMIT",
                params: { value: { answer: 4, unit: "count" } }
              }]
            }]
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toEqual({ answer: 4, unit: "count" })
    }
  })

  test("complete with outputSchema returns parsed object", async () => {
    const ResultSchema = Schema.Struct({
      answer: Schema.Number,
      unit: Schema.String
    })

    const result = await Effect.runPromise(
      complete({
        query: "What is 2+2?",
        context: "math",
        outputSchema: ResultSchema
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [submitValue({ answer: 4, unit: "count" })]
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toEqual({ answer: 4, unit: "count" })
    }
  })

  test("complete with outputSchema fails when value payload is invalid", async () => {
    const ResultSchema = Schema.Struct({ value: Schema.Number })

    const result = await Effect.runPromise(
      complete({
        query: "test",
        context: "ctx",
        outputSchema: ResultSchema
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [submitValue(undefined)]
          })
        )
      )
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(OutputValidationError)
      expect(result.left.message).toContain("does not match output schema")
    }
  })

  test("complete with outputSchema fails on schema mismatch", async () => {
    const ResultSchema = Schema.Struct({ value: Schema.Number })

    const result = await Effect.runPromise(
      complete({
        query: "test",
        context: "ctx",
        outputSchema: ResultSchema
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [submitValue({ value: "not a number" })]
          })
        )
      )
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(OutputValidationError)
      expect(result.left.message).toContain("does not match output schema")
    }
  })

  test("complete with query-only (no context) succeeds", async () => {
    const result = await Effect.runPromise(
      complete({
        query: "What is 2+2?"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [submitAnswer("4")]
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("4")
    }
  })

  test("complete without outputSchema returns SUBMIT answer string", async () => {
    const result = await Effect.runPromise(
      complete({
        query: "test",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [submitAnswer("hello world")]
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("hello world")
    }
  })
})
