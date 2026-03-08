import { describe, expect, test } from "bun:test"
import { Chunk, Deferred, Effect, Exit, Layer, Option, PubSub, Queue, Ref, Schema, Stream } from "effect"
import * as nodeFs from "node:fs"
import * as nodePath from "node:path"
import * as os from "node:os"
import { complete, stream } from "../src/Rlm"
import { LlmCallLive } from "../src/LlmCall"
import { RlmConfig, type RlmConfigService } from "../src/RlmConfig"
import { BudgetExhaustedError, ModelCallError, SandboxError, SchedulerQueueError } from "../src/RlmError"
import { SandboxFactory } from "../src/Sandbox"
import { SandboxBunLive } from "../src/SandboxBun"
import { BridgeHandlerLive } from "../src/BridgeHandler"
import { RlmRuntime, RlmRuntimeLive } from "../src/Runtime"
import { BridgeRequestId, CallId, RlmCommand } from "../src/RlmTypes"
import { runScheduler } from "../src/Scheduler"
import * as RlmTool from "../src/RlmTool"
import { BridgeStoreLive } from "../src/scheduler/BridgeStore"
import { analyzeContext } from "../src/ContextMetadata"
import { makeFakeRlmModelLayer, type FakeModelMetrics, type FakeModelResponse } from "./helpers/FakeRlmModel"
import { makeFakeSandboxFactoryLayer, type FakeSandboxMetrics } from "./helpers/FakeSandboxFactory"
import { makeCustomSandboxFactoryLayer } from "./helpers/CustomSandboxFactory"

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

const runtimeWithBridgeStoreLayer = Layer.merge(
  RlmRuntimeLive,
  Layer.provide(BridgeStoreLive, RlmRuntimeLive)
)

const makeRuntimeWithBridgeStoreLayer = () =>
  Layer.fresh(runtimeWithBridgeStoreLayer)

const makeLayers = (options: {
  readonly responses: ReadonlyArray<FakeModelResponse>
  readonly modelMetrics?: FakeModelMetrics
  readonly sandboxMetrics?: FakeSandboxMetrics
  readonly sandboxOptions?: { executeHandler?: (code: string, vars: Map<string, unknown>) => string }
  readonly config?: Partial<RlmConfigService>
}) => {
  const model = makeFakeRlmModelLayer(options.responses, options.modelMetrics)
  const sandbox = makeFakeSandboxFactoryLayer(options.sandboxMetrics, options.sandboxOptions)
  const runtimeLayer = makeRuntimeWithBridgeStoreLayer()
  const core = Layer.mergeAll(model, sandbox, runtimeLayer)
  const llmCallLayer = Layer.provideMerge(LlmCallLive, core)
  const base = Layer.merge(core, llmCallLayer)
  const configLayer = Layer.succeed(RlmConfig, { ...defaultConfig, ...options.config })
  return Layer.provideMerge(base, configLayer)
}

const submitAnswer = (answer: string, totalTokens?: number): FakeModelResponse => ({
  ...(totalTokens !== undefined ? { totalTokens } : {}),
  toolCalls: [{ name: "SUBMIT", params: { answer } }]
})

describe("Scheduler integration", () => {
  test("generate-execute loop: code block → sandbox execution → output in transcript → next iteration", async () => {
    const sandboxMetrics: FakeSandboxMetrics = {
      createCalls: 0,
      executeCalls: 0,
      snippets: []
    }
    const modelMetrics: FakeModelMetrics = { calls: 0, prompts: [], depths: [] }

    const answer = await Effect.runPromise(
      complete({
        query: "compute something",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              // First response: code block
              { text: "Let me compute:\n```python\nresult = 2 + 2\n```" },
              // Second response after execution: final answer
              submitAnswer("4")
            ],
            sandboxMetrics,
            modelMetrics
          })
        )
      )
    )

    expect(answer._tag).toBe("Right")
    if (answer._tag === "Right") {
      expect(answer.right).toBe("4")
    }

    // Sandbox should have been called to execute the code block
    expect(sandboxMetrics.executeCalls).toBe(1)
    expect(sandboxMetrics.snippets[0]).toBe("result = 2 + 2")

    // Model called twice: once for code gen, once for final
    expect(modelMetrics.calls).toBe(2)

    // Second model call should include execution output in prompt messages
    const secondPrompt = modelMetrics.prompts[1]!
    const userMessages = secondPrompt.content.filter((m) => m.role === "user")
    // Last user message should contain execution output
    const lastUserMsg = userMessages[userMessages.length - 1]!
    const lastUserText = lastUserMsg.role === "user"
      ? (lastUserMsg.content as ReadonlyArray<{ readonly text: string }>)[0]!.text
      : ""
    expect(lastUserText).toContain("[Execution Output]")
    expect(lastUserText).toContain("executed:14") // FakeSandbox returns executed:{length}
  })

  test("execution output truncation uses configured maxExecutionOutputChars", async () => {
    const modelMetrics: FakeModelMetrics = { calls: 0, prompts: [], depths: [] }

    const longSnippet = "x".repeat(200)
    const answer = await Effect.runPromise(
      complete({
        query: "truncate output",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              { text: `\`\`\`js\n${longSnippet}\n\`\`\`` },
              submitAnswer("ok")
            ],
            modelMetrics,
            config: { maxExecutionOutputChars: 5 }
          })
        )
      )
    )

    expect(answer._tag).toBe("Right")
    if (answer._tag === "Right") {
      expect(answer.right).toBe("ok")
    }

    const secondPrompt = modelMetrics.prompts[1]!
    const userMessages = secondPrompt.content.filter((m) => m.role === "user")
    const lastUserMsg = userMessages[userMessages.length - 1]!
    const lastUserText = lastUserMsg.role === "user"
      ? (lastUserMsg.content as ReadonlyArray<{ readonly text: string }>)[0]!.text
      : ""
    expect(lastUserText).toContain("[Execution Output]")
    expect(lastUserText).toContain("[Output truncated at")
    expect(lastUserText).toContain("llm_query()")
  })

  test("variable snapshot sync failure emits warning and loop continues", async () => {
    const model = makeFakeRlmModelLayer([
      { text: "```js\nprint('sync')\n```" },
      submitAnswer("ok")
    ])

    const failingSyncSandboxLayer = Layer.succeed(
      SandboxFactory,
      SandboxFactory.of({
        create: () => {
          const vars = new Map<string, unknown>()
          return Effect.succeed({
            execute: () => Effect.succeed("executed"),
            setVariable: (name: string, value: unknown) =>
              Effect.sync(() => {
                vars.set(name, value)
              }),
            getVariable: (name: string) => Effect.succeed(vars.get(name)),
            listVariables: () => Effect.fail(new SandboxError({ message: "listVariables unavailable" }))
          })
        }
      })
    )

    const core = Layer.mergeAll(
      model,
      failingSyncSandboxLayer,
      makeRuntimeWithBridgeStoreLayer()
    )
    const layers = Layer.provideMerge(
      Layer.merge(core, Layer.provideMerge(LlmCallLive, core)),
      Layer.succeed(RlmConfig, defaultConfig)
    )

    const events = await Effect.runPromise(
      stream({
        query: "sync warning",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.provide(layers)
      )
    )

    const eventList = Chunk.toReadonlyArray(events)
    const warning = eventList.find((event) =>
      event._tag === "SchedulerWarning" && event.code === "VARIABLE_SYNC_FAILED"
    )
    expect(warning).toBeDefined()

    const finalized = eventList.find(
      (event): event is Extract<typeof event, { _tag: "CallFinalized" }> =>
        event._tag === "CallFinalized"
    )
    expect(finalized?.answer).toBe("ok")
  })

  test("SUBMIT tool call finalizes immediately (no sandbox execution)", async () => {
    const sandboxMetrics: FakeSandboxMetrics = {
      createCalls: 0,
      executeCalls: 0,
      snippets: []
    }

    const answer = await Effect.runPromise(
      complete({
        query: "quick answer",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [submitAnswer("42")],
            sandboxMetrics
          })
        )
      )
    )

    expect(answer._tag).toBe("Right")
    if (answer._tag === "Right") {
      expect(answer.right).toBe("42")
    }

    // No sandbox execution for SUBMIT-only response
    expect(sandboxMetrics.executeCalls).toBe(0)
  })

  test("textual FINAL response does not finalize under strict migration", async () => {
    const sandboxMetrics: FakeSandboxMetrics = {
      createCalls: 0,
      executeCalls: 0,
      snippets: []
    }
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      toolChoices: [],
      disableToolCallResolutions: []
    }

    const answer = await Effect.runPromise(
      complete({
        query: "quick answer",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [{
              text: 'FINAL("42")'
            }, {
              text: "still no submit"
            }],
            sandboxMetrics,
            modelMetrics,
            config: { maxIterations: 1 }
          })
        )
      )
    )

    expect(answer._tag).toBe("Left")
    expect(sandboxMetrics.executeCalls).toBe(0)
    expect(modelMetrics.toolChoices?.[0]).toBe("auto")
    expect(modelMetrics.toolChoices?.[1]).toEqual({ tool: "SUBMIT" })
    expect(modelMetrics.disableToolCallResolutions).toEqual([true, true])
  })

  test("SUBMIT tool call takes priority over code blocks in mixed responses", async () => {
    const sandboxMetrics: FakeSandboxMetrics = {
      createCalls: 0,
      executeCalls: 0,
      snippets: []
    }

    const answer = await Effect.runPromise(
      complete({
        query: "mixed response",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [{
              text: "```js\nprint('should not run')\n```",
              toolCalls: [{
                name: "SUBMIT",
                params: { answer: "tool-wins" }
              }]
            }],
            sandboxMetrics
          })
        )
      )
    )

    expect(answer._tag).toBe("Right")
    if (answer._tag === "Right") {
      expect(answer.right).toBe("tool-wins")
    }
    expect(sandboxMetrics.executeCalls).toBe(0)
  })

  test("mixed SUBMIT + code emits warning and still finalizes on SUBMIT", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const runtime = yield* RlmRuntime
          const subscription = yield* PubSub.subscribe(runtime.events)

          const answer = yield* runScheduler({
            query: "mixed response",
            context: "ctx"
          })

          const events = yield* subscription.takeAll
          return { answer, events: Chunk.toReadonlyArray(events) }
        }).pipe(
          Effect.provide(
            makeLayers({
              responses: [{
                text: "```js\nprint('should not run')\n```",
                toolCalls: [{
                  name: "SUBMIT",
                  params: { answer: "tool-wins" }
                }]
              }]
            })
          )
        )
      )
    )

    expect(result.answer).toEqual({ source: "answer", answer: "tool-wins" })
    const warning = result.events.find((event) =>
      event._tag === "SchedulerWarning" && event.code === "MIXED_SUBMIT_AND_CODE"
    )
    expect(warning).toBeDefined()
  })

  test("MIXED_SUBMIT_AND_CODE with variable ref executes code first then resolves SUBMIT", async () => {
    const sandboxMetrics: FakeSandboxMetrics = {
      createCalls: 0,
      executeCalls: 0,
      snippets: []
    }

    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const runtime = yield* RlmRuntime
          const subscription = yield* PubSub.subscribe(runtime.events)

          const answer = yield* runScheduler({
            query: "compute and submit",
            context: "ctx"
          })

          const events = yield* subscription.takeAll
          return { answer, events: Chunk.toReadonlyArray(events) }
        }).pipe(
          Effect.provide(
            makeLayers({
              responses: [{
                text: '```js\n__vars.finalAnswer = "computed-42"\n```',
                toolCalls: [{
                  name: "SUBMIT",
                  params: { variable: "finalAnswer" }
                }]
              }],
              sandboxMetrics,
              sandboxOptions: {
                executeHandler: (_code, vars) => {
                  vars.set("finalAnswer", "computed-42")
                  return "done"
                }
              }
            })
          )
        )
      )
    )

    // Code should have been executed first
    expect(sandboxMetrics.executeCalls).toBe(1)
    expect(sandboxMetrics.snippets[0]).toBe('__vars.finalAnswer = "computed-42"')
    // SUBMIT should resolve the variable set by code execution
    expect(result.answer).toEqual({ source: "answer", answer: "computed-42" })
    // Should emit MIXED_SUBMIT_AND_CODE warning about executing code first
    const warning = result.events.find((event) =>
      event._tag === "SchedulerWarning" && event.code === "MIXED_SUBMIT_AND_CODE"
    )
    expect(warning).toBeDefined()
    if (warning && warning._tag === "SchedulerWarning") {
      expect(warning.message).toContain("executing code first")
    }
  })

  test("MIXED_SUBMIT_AND_CODE with variable ref falls back when variable missing after execution", async () => {
    const sandboxMetrics: FakeSandboxMetrics = {
      createCalls: 0,
      executeCalls: 0,
      snippets: []
    }

    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const runtime = yield* RlmRuntime
          const subscription = yield* PubSub.subscribe(runtime.events)

          const answer = yield* runScheduler({
            query: "compute and submit",
            context: "ctx"
          }).pipe(Effect.either)

          const events = yield* subscription.takeAll
          return { answer, events: Chunk.toReadonlyArray(events) }
        }).pipe(
          Effect.provide(
            makeLayers({
              responses: [
                // First: code + variable SUBMIT, but code doesn't set the variable
                {
                  text: '```js\n__vars.wrongName = "oops"\n```',
                  toolCalls: [{
                    name: "SUBMIT",
                    params: { variable: "finalAnswer" }
                  }]
                },
                // Second: model corrects itself with direct SUBMIT
                submitAnswer("corrected-answer")
              ],
              sandboxMetrics,
              sandboxOptions: {
                executeHandler: (_code, vars) => {
                  vars.set("wrongName", "oops")
                  return "done"
                }
              }
            })
          )
        )
      )
    )

    // Code should have been executed
    expect(sandboxMetrics.executeCalls).toBe(1)
    // Should emit SUBMIT_RESOLVE_FAILED after code ran but variable was missing
    const resolveFailedWarning = result.events.find((event) =>
      event._tag === "SchedulerWarning" && event.code === "SUBMIT_RESOLVE_FAILED"
    )
    expect(resolveFailedWarning).toBeDefined()
    if (resolveFailedWarning && resolveFailedWarning._tag === "SchedulerWarning") {
      expect(resolveFailedWarning.message).toContain("after code execution")
    }
    // Model should get another chance and succeed with direct answer
    expect(result.answer._tag).toBe("Right")
    if (result.answer._tag === "Right") {
      expect(result.answer.right).toEqual({ source: "answer", answer: "corrected-answer" })
    }
  })

  test("tool-enabled generation degrades to text mode when tool path fails", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      toolChoices: [],
      disableToolCallResolutions: []
    }

    const result = await Effect.runPromise(
      complete({
        query: "fallback on tool decode failure",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              { error: "Failed to decode tool call parameters for tool 'SUBMIT'" },
              submitAnswer("fallback-ok")
            ],
            modelMetrics
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("fallback-ok")
    }
    expect(modelMetrics.toolChoices).toEqual(["auto", "none"])
    expect(modelMetrics.disableToolCallResolutions).toEqual([true, undefined])
  })

  test("extract fallback forces SUBMIT tool choice", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      toolChoices: [],
      disableToolCallResolutions: []
    }

    const result = await Effect.runPromise(
      complete({
        query: "compute",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              { text: "I need one more pass." },
              {
                toolCalls: [{
                  name: "SUBMIT",
                  params: { answer: "extracted" }
                }]
              }
            ],
            modelMetrics,
            config: { maxIterations: 1 }
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("extracted")
    }
    expect(modelMetrics.calls).toBe(2)
    expect(modelMetrics.toolChoices?.[0]).toBe("auto")
    expect(modelMetrics.toolChoices?.[1]).toEqual({ tool: "SUBMIT" })
    expect(modelMetrics.disableToolCallResolutions?.[0]).toBe(true)
    expect(modelMetrics.disableToolCallResolutions?.[1]).toBe(true)
  })

  test("extract fallback resolves SUBMIT variable tool calls", async () => {
    const result = await Effect.runPromise(
      complete({
        query: "from-query-variable",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              { text: "I need one more pass." },
              {
                toolCalls: [{
                  name: "SUBMIT",
                  params: { variable: "query" }
                }]
              }
            ],
            config: { maxIterations: 1 }
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("from-query-variable")
    }
  })

  test("extract path degrades to text mode when forced SUBMIT tool path fails", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      toolChoices: [],
      disableToolCallResolutions: []
    }

    const result = await Effect.runPromise(
      complete({
        query: "compute",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              { text: "I need one more pass." },
              { error: "Failed to decode tool call parameters for tool 'SUBMIT'" },
              submitAnswer("extract-fallback")
            ],
            modelMetrics,
            config: { maxIterations: 1 }
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("extract-fallback")
    }
    expect(modelMetrics.toolChoices).toEqual(["auto", { tool: "SUBMIT" }, "none"])
    expect(modelMetrics.disableToolCallResolutions).toEqual([true, true, undefined])
  })

  test("extract text-mode fallback does not parse textual SUBMIT variable snippets", async () => {
    const result = await Effect.runPromise(
      complete({
        query: "compute",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              { text: "I need one more pass." },
              { error: "Failed to decode tool call parameters for tool 'SUBMIT'" },
              { text: 'SUBMIT({ variable: "query" })' }
            ],
            config: { maxIterations: 1 }
          })
        )
      )
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("NoFinalAnswerError")
    }
  })

  test("consecutive near-empty responses trigger early extract fallback", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      toolChoices: [],
      disableToolCallResolutions: []
    }

    const events = await Effect.runPromise(
      stream({
        query: "stall detector",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.provide(
          makeLayers({
            responses: [
              { text: "hmm" },
              { text: "ok" },
              { text: "..." },
              submitAnswer("early-extracted")
            ],
            modelMetrics,
            config: {
              maxIterations: 10,
              stallConsecutiveLimit: 3,
              stallResponseMaxChars: 3
            }
          })
        )
      )
    )

    const eventList = Chunk.toReadonlyArray(events)
    const finalized = eventList.find(
      (event): event is Extract<typeof event, { _tag: "CallFinalized" }> =>
        event._tag === "CallFinalized" && event.depth === 0
    )
    expect(finalized).toBeDefined()
    expect(finalized?.answer).toBe("early-extracted")

    const warning = eventList.find(
      (event): event is Extract<typeof event, { _tag: "SchedulerWarning" }> =>
        event._tag === "SchedulerWarning" && event.code === "STALL_DETECTED_EARLY_EXTRACT"
    )
    expect(warning).toBeDefined()
    expect(modelMetrics.toolChoices).toEqual(["auto", "auto", "auto", { tool: "SUBMIT" }])
  })

  test("non-stall response resets consecutive stall counter", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      toolChoices: [],
      disableToolCallResolutions: []
    }

    const result = await Effect.runPromise(
      complete({
        query: "stall reset",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              { text: "hmm" },
              { text: "This is a sufficiently long planning note that should reset stalling." },
              { text: "ok" },
              { text: "yo" },
              submitAnswer("normal-submit")
            ],
            modelMetrics,
            config: {
              maxIterations: 10,
              stallConsecutiveLimit: 3,
              stallResponseMaxChars: 3
            }
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("normal-submit")
    }
    expect(modelMetrics.toolChoices).toEqual(["auto", "auto", "auto", "auto", "auto"])
  })

  test("threads large structured context metadata into REPL system prompt for corpus guidance", async () => {
    const modelMetrics: FakeModelMetrics = { calls: 0, prompts: [], depths: [] }
    const makeNoopTool = (name: string) =>
      RlmTool.make(name, {
        description: `${name} noop`,
        parameters: { arg: Schema.String },
        returns: Schema.String,
        handler: () => Effect.succeed("ok")
      })

    const ndjsonContext = Array.from({ length: 80 }, (_, index) =>
      JSON.stringify({ id: index, text: `post-${index}` })
    ).join("\n")

    const result = await Effect.runPromise(
      complete({
        query: "find trends",
        context: ndjsonContext,
        contextMetadata: analyzeContext(ndjsonContext, "feed.ndjson"),
        tools: [
          makeNoopTool("CreateCorpus"),
          makeNoopTool("LearnCorpus"),
          makeNoopTool("QueryCorpus")
        ]
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              { text: "```js\nprint('inspecting')\n```" },
              submitAnswer("ok")
            ],
            modelMetrics
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("ok")
    }

    const firstPrompt = modelMetrics.prompts[0]!
    const firstSystemMessage = firstPrompt.content.find((message) => message.role === "system")
    let firstSystemText = ""
    if (firstSystemMessage?.role === "system") {
      const content = firstSystemMessage.content
      if (typeof content === "string") {
        firstSystemText = content
      } else {
        firstSystemText = (content[0] as { readonly text: string } | undefined)?.text ?? ""
      }
    }

    expect(firstSystemText).toContain("### Context-Specific Guidance")
    expect(firstSystemText).toContain("CreateCorpus")
    expect(firstSystemText).toContain("QueryCorpus")
  })

  test("no code block and no SUBMIT → loops to next GenerateStep", async () => {
    const modelMetrics: FakeModelMetrics = { calls: 0, prompts: [], depths: [] }
    const sandboxMetrics: FakeSandboxMetrics = {
      createCalls: 0,
      executeCalls: 0,
      snippets: []
    }

    const answer = await Effect.runPromise(
      complete({
        query: "think about it",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              { text: "Let me think about this..." },
              { text: "Still thinking..." },
              submitAnswer("thought complete")
            ],
            modelMetrics,
            sandboxMetrics
          })
        )
      )
    )

    expect(answer._tag).toBe("Right")
    if (answer._tag === "Right") {
      expect(answer.right).toBe("thought complete")
    }

    // 3 model calls, 0 sandbox executions (no code blocks)
    expect(modelMetrics.calls).toBe(3)
    expect(sandboxMetrics.executeCalls).toBe(0)
  })

  test("deterministic event sequence for generate-execute loop", async () => {
    const events = await Effect.runPromise(
      stream({
        query: "compute",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.provide(
          makeLayers({
            responses: [
              { text: "```js\nprint(42)\n```" },
              submitAnswer("42")
            ]
          })
        )
      )
    )

    const eventTags = Chunk.toReadonlyArray(events).map((e) => e._tag)

    expect(eventTags).toEqual([
      "CallStarted",
      "IterationStarted",
      "ModelResponse",
      "CodeExecutionStarted",
      "CodeExecutionCompleted",
      "IterationStarted",
      "ModelResponse",
      "CallFinalized"
    ])
  })

  test("multiple code blocks across iterations", async () => {
    const sandboxMetrics: FakeSandboxMetrics = {
      createCalls: 0,
      executeCalls: 0,
      snippets: []
    }

    const answer = await Effect.runPromise(
      complete({
        query: "multi-step",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              { text: "```js\nstep1()\n```" },
              { text: "```js\nstep2()\n```" },
              submitAnswer("done")
            ],
            sandboxMetrics
          })
        )
      )
    )

    expect(answer._tag).toBe("Right")
    if (answer._tag === "Right") {
      expect(answer.right).toBe("done")
    }
    expect(sandboxMetrics.executeCalls).toBe(2)
    expect(sandboxMetrics.snippets).toEqual(["step1()", "step2()"])
  })

  test("existing tests still pass: returns final answer from scripted model", async () => {
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

  test("extract fallback when max iterations exhausted", async () => {
    const result = await Effect.runPromise(
      complete({
        query: "compute",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              { text: "```js\nstep1()\n```" },
              { text: "```js\nstep2()\n```" },
              submitAnswer("extracted")
            ],
            config: { maxIterations: 2 }
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("extracted")
    }
  })

  test("extract fallback fails when no SUBMIT is returned", async () => {
    const result = await Effect.runPromise(
      complete({
        query: "compute",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              { text: "```js\nstep1()\n```" },
              { text: "```js\nstep2()\n```" },
              { text: "The answer is 42" }
            ],
            config: { maxIterations: 2 }
          })
        )
      )
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("NoFinalAnswerError")
    }
  })

  test("extract fallback fails when LLM call budget also exhausted", async () => {
    const result = await Effect.runPromise(
      complete({
        query: "compute",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              { text: "```js\nstep1()\n```" },
              submitAnswer("unreachable")
            ],
            config: { maxIterations: 1, maxLlmCalls: 1 }
          })
        )
      )
    )

    expect(result._tag).toBe("Left")
  })

  test("retryable model failures retry once and then succeed", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: []
    }

    const result = await Effect.runPromise(
      complete({
        query: "retry model call",
        context: "x".repeat(400)
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              {
                error: "transient upstream timeout",
                retryable: true,
                provider: "anthropic",
                model: "fake-model"
              },
              submitAnswer("recovered")
            ],
            modelMetrics,
            config: {
              llmRetryCount: 1,
              llmRetryBaseDelayMs: 1,
              llmRetryJitter: false,
              maxLlmCalls: 2
            }
          })
        )
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("recovered")
    }
    expect(modelMetrics.calls).toBe(2)
  })

  test("non-retryable model failures do not retry", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: []
    }

    const result = await Effect.runPromise(
      complete({
        query: "no retry",
        context: "x".repeat(400)
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              {
                error: "invalid request payload",
                retryable: false,
                provider: "anthropic",
                model: "fake-model"
              }
            ],
            modelMetrics,
            config: {
              llmRetryCount: 3,
              llmRetryBaseDelayMs: 1,
              llmRetryJitter: false,
              maxLlmCalls: 5
            }
          })
        )
      )
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(ModelCallError)
      expect((result.left as ModelCallError).retryable).toBe(false)
    }
    expect(modelMetrics.calls).toBe(1)
  })

  test("retry attempts consume llm call budget per attempt", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: []
    }

    const result = await Effect.runPromise(
      complete({
        query: "budgeted retry",
        context: "x".repeat(400)
      }).pipe(
        Effect.either,
        Effect.provide(
          makeLayers({
            responses: [
              {
                error: "transient overloaded upstream",
                retryable: true,
                provider: "anthropic",
                model: "fake-model"
              },
              submitAnswer("should-not-run")
            ],
            modelMetrics,
            config: {
              llmRetryCount: 1,
              llmRetryBaseDelayMs: 1,
              llmRetryJitter: false,
              maxLlmCalls: 1
            }
          })
        )
      )
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(BudgetExhaustedError)
    }
    expect(modelMetrics.calls).toBe(1)
  })

  test("drops stale commands and emits SchedulerWarning without failing root run", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const runtime = yield* RlmRuntime
          const subscription = yield* PubSub.subscribe(runtime.events)

          // Inject stale work before scheduler starts processing queue.
          yield* Queue.offer(runtime.commands, RlmCommand.GenerateStep({
            callId: CallId("stale-call")
          }))

          const answer = yield* runScheduler({
            query: "warn on stale",
            context: "ctx"
          })

          const events = yield* subscription.takeAll
          return { answer, events: Chunk.toReadonlyArray(events) }
        }).pipe(
          Effect.provide(
            makeLayers({
              responses: [submitAnswer("ok")]
            })
          )
        )
      )
    )

    expect(result.answer).toEqual({ source: "answer", answer: "ok" })
    const staleWarning = result.events.find((event) =>
      event._tag === "SchedulerWarning" &&
      event.code === "STALE_COMMAND_DROPPED" &&
      event.commandTag === "GenerateStep"
    )
    expect(staleWarning).toBeDefined()
  })

  test("queue overload fails root call fast and emits terminal overload warning", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const runtime = yield* RlmRuntime
          const subscription = yield* PubSub.subscribe(runtime.events)

          // Fill the single-slot queue before scheduler startup.
          yield* Queue.offer(runtime.commands, RlmCommand.GenerateStep({
            callId: CallId("prefilled")
          }))

          const schedulerResult = yield* runScheduler({
            query: "queue overload",
            context: "ctx"
          }).pipe(
            Effect.either,
            Effect.timeout("2 seconds")
          )

          const events = Chunk.toReadonlyArray(yield* subscription.takeAll)
          const offerAfterShutdown = yield* Effect.exit(
            Queue.offer(runtime.commands, RlmCommand.GenerateStep({ callId: CallId("after-shutdown") }))
          )

          return {
            schedulerResult,
            events,
            offerAfterShutdown
          }
        }).pipe(
          Effect.provide(
            makeLayers({
              responses: [submitAnswer("unreachable")],
              config: {
                commandQueueCapacity: 1
              }
            })
          )
        )
      )
    )

    expect(result.schedulerResult._tag).toBe("Left")
    if (result.schedulerResult._tag === "Left") {
      expect(result.schedulerResult.left).toBeInstanceOf(SchedulerQueueError)
      if (result.schedulerResult.left instanceof SchedulerQueueError) {
        expect(result.schedulerResult.left.reason).toBe("overloaded")
        expect(result.schedulerResult.left.commandTag).toBe("StartCall")
      }
    }

    const overloadWarnings = result.events.filter((event) =>
      event._tag === "SchedulerWarning" && event.code === "QUEUE_OVERLOADED_FATAL"
    )
    expect(overloadWarnings.length).toBe(1)

    const rootFailed = result.events.find((event) =>
      event._tag === "CallFailed" && event.callId === CallId("root")
    )
    expect(rootFailed).toBeDefined()
    expect(Exit.isFailure(result.offerAfterShutdown)).toBe(true)
  })

  test("scheduler interruption closes call scopes, bridge pending state, and command queue", async () => {
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

    const core = Layer.mergeAll(
      makeFakeRlmModelLayer([{ text: "```js\nprint('hanging')\n```" }]),
      hangingSandboxLayer,
      makeRuntimeWithBridgeStoreLayer()
    )
    const layers = Layer.provideMerge(
      Layer.merge(core, Layer.provideMerge(LlmCallLive, core)),
      Layer.succeed(RlmConfig, defaultConfig)
    )

    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const runtime = yield* RlmRuntime
        const leakedBridge = yield* Deferred.make<unknown, SandboxError>()
        const leakedBridgeRequestId = BridgeRequestId("leaked-bridge")
        yield* Ref.update(runtime.bridgePending, (current) => {
          const next = new Map(current)
          next.set(leakedBridgeRequestId, leakedBridge)
          return next
        })

        const timeout = yield* runScheduler({
          query: "hang forever",
          context: "ctx"
        }).pipe(Effect.timeoutOption("200 millis"))

        const statesAfter = yield* Ref.get(runtime.callStates)
        const bridgePendingAfter = yield* Ref.get(runtime.bridgePending)
        const leakedBridgeResult = yield* Deferred.await(leakedBridge).pipe(Effect.either)
        const offerAfterShutdown = yield* Effect.exit(
          Queue.offer(runtime.commands, RlmCommand.GenerateStep({ callId: CallId("after-timeout") }))
        )

        return {
          timeout,
          remainingStates: statesAfter.size,
          remainingBridgePending: bridgePendingAfter.size,
          leakedBridgeResult,
          offerAfterShutdown
        }
      }).pipe(Effect.provide(layers))
    )

    expect(Option.isNone(result.timeout)).toBe(true)
    expect(result.remainingStates).toBe(0)
    expect(result.remainingBridgePending).toBe(0)
    expect(result.leakedBridgeResult._tag).toBe("Left")
    if (result.leakedBridgeResult._tag === "Left") {
      expect(result.leakedBridgeResult.left).toBeInstanceOf(SandboxError)
      expect(result.leakedBridgeResult.left.message).toContain("Scheduler stopped")
    }
    expect(Exit.isFailure(result.offerAfterShutdown)).toBe(true)
  })

  test("execution error surfaces as output and model can recover", async () => {
    const metrics = { createCalls: 0, executeCalls: 0, snippets: [] as Array<string> }
    const failOnceSandboxLayer = makeCustomSandboxFactoryLayer({
      metrics,
      execute: (code, callNumber) =>
        callNumber === 1
          ? Effect.fail(new SandboxError({ message: "ReferenceError: x is not defined" }))
          : Effect.succeed(`executed:${code.length}`)
    })

    const modelMetrics: FakeModelMetrics = { calls: 0, prompts: [], depths: [] }
    const model = makeFakeRlmModelLayer([
      { text: "```js\nlet y = x + 1\n```" },
      { text: "```js\nlet y = 1 + 1\n```" },
      submitAnswer("recovered")
    ], modelMetrics)

    const core = Layer.mergeAll(model, failOnceSandboxLayer, makeRuntimeWithBridgeStoreLayer())
    const layers = Layer.provideMerge(
      Layer.merge(core, Layer.provideMerge(LlmCallLive, core)),
      Layer.succeed(RlmConfig, defaultConfig)
    )

    const result = await Effect.runPromise(
      complete({ query: "compute", context: "ctx" }).pipe(
        Effect.either,
        Effect.provide(layers)
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("recovered")
    }
    expect(metrics.executeCalls).toBe(2)
  })

  test("repeated execution errors consume iterations until extract fallback", async () => {
    const alwaysFailSandboxLayer = makeCustomSandboxFactoryLayer({
      execute: () => Effect.fail(new SandboxError({ message: "always fails" }))
    })

    const model = makeFakeRlmModelLayer([
      { text: "```js\nfail()\n```" },
      { text: "```js\nfail()\n```" },
      submitAnswer("extracted")
    ])

    const core = Layer.mergeAll(model, alwaysFailSandboxLayer, makeRuntimeWithBridgeStoreLayer())
    const layers = Layer.provideMerge(
      Layer.merge(core, Layer.provideMerge(LlmCallLive, core)),
      Layer.succeed(RlmConfig, { ...defaultConfig, maxIterations: 2 })
    )

    const result = await Effect.runPromise(
      complete({ query: "compute", context: "ctx" }).pipe(
        Effect.either,
        Effect.provide(layers)
      )
    )

    expect(result._tag).toBe("Right")
    if (result._tag === "Right") {
      expect(result.right).toBe("extracted")
    }
  })

  test("error message appears in subsequent model prompt", async () => {
    const metrics = { createCalls: 0, executeCalls: 0, snippets: [] as Array<string> }
    const failOnceSandboxLayer = makeCustomSandboxFactoryLayer({
      metrics,
      execute: (code, callNumber) =>
        callNumber === 1
          ? Effect.fail(new SandboxError({ message: "ReferenceError: x is not defined" }))
          : Effect.succeed(`executed:${code.length}`)
    })

    const modelMetrics: FakeModelMetrics = { calls: 0, prompts: [], depths: [] }
    const model = makeFakeRlmModelLayer([
      { text: "```js\nlet y = x + 1\n```" },
      { text: "```js\nlet y = 1 + 1\n```" },
      submitAnswer("ok")
    ], modelMetrics)

    const core = Layer.mergeAll(model, failOnceSandboxLayer, makeRuntimeWithBridgeStoreLayer())
    const layers = Layer.provideMerge(
      Layer.merge(core, Layer.provideMerge(LlmCallLive, core)),
      Layer.succeed(RlmConfig, defaultConfig)
    )

    await Effect.runPromise(
      complete({ query: "compute", context: "ctx" }).pipe(
        Effect.either,
        Effect.provide(layers)
      )
    )

    // Second model call should see the error in its prompt
    const secondPrompt = modelMetrics.prompts[1]!
    const userMessages = secondPrompt.content.filter((m) => m.role === "user")
    const lastUserMsg = userMessages[userMessages.length - 1]!
    const lastUserText = lastUserMsg.role === "user"
      ? (lastUserMsg.content as ReadonlyArray<{ readonly text: string }>)[0]!.text
      : ""
    expect(lastUserText).toContain("Error: ReferenceError: x is not defined")
  })

  test("error-path emits CodeExecutionStarted + CodeExecutionCompleted", async () => {
    const failOnceSandboxLayer = makeCustomSandboxFactoryLayer({
      execute: (code, callNumber) =>
        callNumber === 1
          ? Effect.fail(new SandboxError({ message: "boom" }))
          : Effect.succeed(`executed:${code.length}`)
    })

    const model = makeFakeRlmModelLayer([
      { text: "```js\nbad()\n```" },
      { text: "```js\ngood()\n```" },
      submitAnswer("ok")
    ])

    const core = Layer.mergeAll(model, failOnceSandboxLayer, makeRuntimeWithBridgeStoreLayer())
    const layers = Layer.provideMerge(
      Layer.merge(core, Layer.provideMerge(LlmCallLive, core)),
      Layer.succeed(RlmConfig, defaultConfig)
    )

    const events = await Effect.runPromise(
      stream({ query: "compute", context: "ctx" }).pipe(
        Stream.runCollect,
        Effect.provide(layers)
      )
    )

    const eventTags = Chunk.toReadonlyArray(events).map((e) => e._tag)

    // First iteration: code → error surfaced as CodeExecuted
    // Second iteration: code → success
    // Third iteration: SUBMIT
    expect(eventTags).toEqual([
      "CallStarted",
      "IterationStarted",
      "ModelResponse",
      "CodeExecutionStarted",
      "CodeExecutionCompleted",  // error output
      "IterationStarted",
      "ModelResponse",
      "CodeExecutionStarted",
      "CodeExecutionCompleted",  // success output
      "IterationStarted",
      "ModelResponse",
      "CallFinalized"
    ])

    // Verify the first CodeExecutionCompleted contains the error
    const execCompletedEvents = Chunk.toReadonlyArray(events).filter(
      (e): e is Extract<typeof e, { _tag: "CodeExecutionCompleted" }> =>
        e._tag === "CodeExecutionCompleted"
    )
    expect(execCompletedEvents[0]!.output).toContain("Error: boom")
  })

  test("primitive execution errors do not stall and surface as deterministic output", async () => {
    const modelMetrics: FakeModelMetrics = { calls: 0, prompts: [], depths: [] }
    const primitiveFailOnceSandboxLayer = makeCustomSandboxFactoryLayer({
      execute: (code, callNumber) =>
        callNumber === 1
          ? Effect.fail("boom")
          : Effect.succeed(`executed:${code.length}`)
    })

    const model = makeFakeRlmModelLayer([
      { text: "```js\nlet y = x + 1\n```" },
      { text: "```js\nlet y = 1 + 1\n```" },
      submitAnswer("ok")
    ], modelMetrics)

    const core = Layer.mergeAll(model, primitiveFailOnceSandboxLayer, makeRuntimeWithBridgeStoreLayer())
    const layers = Layer.provideMerge(
      Layer.merge(core, Layer.provideMerge(LlmCallLive, core)),
      Layer.succeed(RlmConfig, defaultConfig)
    )

    const result = await Effect.runPromise(
      complete({ query: "compute", context: "ctx" }).pipe(
        Effect.either,
        Effect.provide(layers),
        Effect.timeoutOption("5 seconds")
      )
    )

    expect(Option.isSome(result)).toBe(true)
    if (Option.isSome(result)) {
      expect(result.value._tag).toBe("Right")
      if (result.value._tag === "Right") {
        expect(result.value.right).toBe("ok")
      }
    }

    // Second model call should see primitive failure text as execution output.
    const secondPrompt = modelMetrics.prompts[1]!
    const userMessages = secondPrompt.content.filter((m) => m.role === "user")
    const lastUserMsg = userMessages[userMessages.length - 1]!
    const lastUserText = lastUserMsg.role === "user"
      ? (lastUserMsg.content as ReadonlyArray<{ readonly text: string }>)[0]!.text
      : ""
    expect(lastUserText).toContain("Error: boom")
  })

  test("StartCall failure with failing sandbox factory does not hang", async () => {
    const failingSandboxLayer = Layer.succeed(
      SandboxFactory,
      SandboxFactory.of({
        create: () => Effect.fail(new SandboxError({ message: "Factory create failed" }))
      })
    )

    const model = makeFakeRlmModelLayer(
      [submitAnswer("unreachable")]
    )

    const runtimeLayer = makeRuntimeWithBridgeStoreLayer()
    const core = Layer.mergeAll(model, failingSandboxLayer, runtimeLayer)
    const layers = Layer.provideMerge(
      Layer.merge(core, Layer.provideMerge(LlmCallLive, core)),
      Layer.succeed(RlmConfig, defaultConfig)
    )

    const result = await Effect.runPromise(
      complete({
        query: "should fail",
        context: "ctx"
      }).pipe(
        Effect.either,
        Effect.provide(layers),
        Effect.timeout("5 seconds")
      )
    )

    expect(result).not.toBeUndefined()
    if (result && "_tag" in result) {
      expect(result._tag).toBe("Left")
    }
  }, 10_000)

  test("rejects invalid programmatic input names before staging", async () => {
    const tmpDir = nodeFs.mkdtempSync(nodePath.join(os.tmpdir(), "rlm-invalid-input-"))
    const filePath = nodePath.join(tmpDir, "data.txt")
    nodeFs.writeFileSync(filePath, "hello")

    try {
      const result = await Effect.runPromise(
        complete({
          query: "test invalid input name",
          context: "",
          inputs: [{ name: "../escape", path: filePath }]
        }).pipe(
          Effect.either,
          Effect.provide(
            makeLayers({
              responses: [submitAnswer("unreachable")]
            })
          ),
          Effect.timeout("5 seconds")
        )
      )

      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        const causeMessage = String((result.left as { readonly cause?: unknown }).cause ?? "")
        expect(causeMessage).toContain("Invalid input file name")
      }
    } finally {
      nodeFs.rmSync(tmpDir, { recursive: true, force: true })
    }
  }, 10_000)
})

describe("Scheduler tool dispatch (e2e with real sandbox)", () => {
  const makeRealSandboxLayers = (options: {
    readonly responses: ReadonlyArray<FakeModelResponse>
    readonly modelMetrics?: FakeModelMetrics
    readonly config?: Partial<RlmConfigService>
  }) => {
    const model = makeFakeRlmModelLayer(options.responses, options.modelMetrics)
    const runtimeLayer = runtimeWithBridgeStoreLayer
    const bridgeHandlerLayer = Layer.provideMerge(
      BridgeHandlerLive,
      runtimeLayer
    )
    const llmCallLayer = Layer.provideMerge(
      LlmCallLive,
      runtimeLayer
    )
    const perCallLayer = Layer.fresh(
      Layer.provideMerge(
        Layer.mergeAll(
          SandboxBunLive,
          llmCallLayer
        ),
        bridgeHandlerLayer
      )
    )
    const base = Layer.merge(
      model,
      Layer.provideMerge(perCallLayer, model)
    )
    const configLayer = Layer.succeed(RlmConfig, { ...defaultConfig, ...options.config })
    return Layer.provideMerge(base, configLayer)
  }

  test("tool bridge call flows through scheduler dispatch", async () => {
    let toolCalled = false

    const addTool = RlmTool.make("add", {
      description: "Add two numbers",
      parameters: { a: Schema.Number, b: Schema.Number },
      returns: Schema.Number,
      handler: ({ a, b }) => {
        toolCalled = true
        return Effect.succeed(a + b)
      }
    })

    const answer = await Effect.runPromise(
      complete({
        query: "compute 2+3",
        context: "math",
        tools: [addTool]
      }).pipe(
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nconst result = await add(2, 3)\nprint(result)\n```" },
            submitAnswer("5")
          ]
        })),
        Effect.timeout("10 seconds")
      )
    )

    expect(toolCalled).toBe(true)
    expect(answer).toBe("5")
  }, 15_000)

  test("stages input files for recursive sub-calls", async () => {
    const tmpDir = nodeFs.mkdtempSync(nodePath.join(os.tmpdir(), "rlm-input-subcall-"))
    const hostInput = nodePath.join(tmpDir, "notes.txt")
    nodeFs.writeFileSync(hostInput, "hello-from-input\n")

    try {
      const answer = await Effect.runPromise(
        complete({
          query: "read staged input recursively",
          context: "",
          inputs: [{ name: "notes", path: hostInput }]
        }).pipe(
          Effect.provide(makeRealSandboxLayers({
            responses: [
              {
                text: "```js\nconst child = await llm_query('read from staged file', '')\n__vars.child = child\nprint(child)\n```"
              },
              {
                text: "```js\nconst text = await readFile('notes.txt')\n__vars.text = text.trim()\nprint(__vars.text)\n```"
              },
              { toolCalls: [{ name: "SUBMIT", params: { variable: "text" } }] },
              { toolCalls: [{ name: "SUBMIT", params: { variable: "child" } }] }
            ],
            config: { maxDepth: 2 }
          })),
          Effect.timeout("15 seconds")
        )
      )

      expect(answer).toBe("hello-from-input")
    } finally {
      nodeFs.rmSync(tmpDir, { recursive: true, force: true })
    }
  }, 20_000)

  test("tool bridge calls retry transient failures before surfacing errors", async () => {
    let attempts = 0
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: []
    }

    const flakyAdd = RlmTool.make("flaky_add", {
      description: "Add two numbers with a transient failure",
      parameters: { a: Schema.Number, b: Schema.Number },
      returns: Schema.Number,
      handler: ({ a, b }) => {
        attempts += 1
        if (attempts === 1) {
          return Effect.fail(new RlmTool.RlmToolError({
            message: "transient tool failure",
            toolName: "flaky_add"
          }))
        }
        return Effect.succeed(a + b)
      }
    })

    const answer = await Effect.runPromise(
      complete({
        query: "retry flaky tool",
        context: "math",
        tools: [flakyAdd]
      }).pipe(
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nconst result = await flaky_add(2, 3)\nprint(result)\n```" },
            submitAnswer("5")
          ],
          modelMetrics
        })),
        Effect.timeout("10 seconds")
      )
    )

    expect(answer).toBe("5")
    expect(attempts).toBe(2)

    const secondPrompt = modelMetrics.prompts[1]!
    const userMessages = secondPrompt.content.filter((m) => m.role === "user")
    const lastUserMsg = userMessages[userMessages.length - 1]!
    const lastUserText = lastUserMsg.role === "user"
      ? (lastUserMsg.content as ReadonlyArray<{ readonly text: string }>)[0]!.text
      : ""
    expect(lastUserText).toContain("[Execution Output]")
    expect(lastUserText).toContain("5")
    expect(lastUserText).not.toContain("Error:")
  }, 15_000)

  test("unknown tool method fails bridge deferred", async () => {
    const answer = await Effect.runPromise(
      complete({
        query: "test unknown tool",
        context: "ctx"
      }).pipe(
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\ntry {\n  await nonexistent('arg')\n} catch (e) {\n  print('caught: ' + e.message)\n}\n```" },
            submitAnswer("handled")
          ]
        })),
        Effect.timeout("10 seconds")
      )
    )

    // The sandbox should catch the error since nonexistent is not a defined function
    expect(answer).toBe("handled")
  }, 15_000)

  test("max-depth llm_query retries transient sub-call failures and recovers", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      isSubCalls: []
    }

    const answer = await Effect.runPromise(
      complete({
        query: "retry llm_query",
        context: "ctx"
      }).pipe(
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nconst result = await llm_query('sub-query', 'sub-context')\nprint(result)\n```" },
            { error: "transient sub-call model error" },
            { text: "sub-answer" },
            submitAnswer("sub-answer"),
            submitAnswer("done")
          ],
          modelMetrics,
          config: {
            maxDepth: 0
          }
        })),
        Effect.timeout("10 seconds")
      )
    )

    expect(answer).toBe("sub-answer")
    expect(modelMetrics.depths[0]).toBe(0)
    expect(modelMetrics.depths.some((depth) => depth === 1)).toBe(true)
    expect(modelMetrics.isSubCalls?.[0]).toBe(false)
    expect(modelMetrics.isSubCalls?.some((value) => value === true)).toBe(true)

    const finalPrompt = modelMetrics.prompts[modelMetrics.prompts.length - 1]!
    const userMessages = finalPrompt.content.filter((m) => m.role === "user")
    const lastUserMsg = userMessages[userMessages.length - 1]!
    const lastUserText = lastUserMsg.role === "user"
      ? (lastUserMsg.content as ReadonlyArray<{ readonly text: string }>)[0]!.text
      : ""
    expect(lastUserText).toContain("[Execution Output]")
    expect(lastUserText).toContain("sub-answer")
  }, 15_000)

  test("llm_query rejects empty query arguments before model invocation", async () => {
    const events = await Effect.runPromise(
      stream({
        query: "empty llm_query guard",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\ntry {\n  await llm_query('', 'sub-context')\n} catch (e) {\n  print('caught: ' + e.message)\n}\n```" },
            submitAnswer("done")
          ],
          config: {
            maxDepth: 0
          }
        })),
        Effect.timeout("10 seconds")
      )
    )

    const eventList = Chunk.toReadonlyArray(events)
    const execCompleted = eventList.find(
      (event): event is Extract<typeof event, { _tag: "CodeExecutionCompleted" }> =>
        event._tag === "CodeExecutionCompleted"
    )

    expect(execCompleted).toBeDefined()
    expect(execCompleted!.output).toContain("llm_query requires a non-empty query string as the first argument")
    expect(eventList.some((event) => event._tag === "CallFailed")).toBe(false)
  }, 15_000)

  test("concurrent duplicate llm_query calls dedupe and emit cache hit/miss", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      isSubCalls: []
    }

    const events = await Effect.runPromise(
      stream({
        query: "cache dedup concurrent",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nconst [left, right] = await Promise.all([\n  llm_query('same query', 'same context'),\n  llm_query('same query', 'same context')\n])\nprint(JSON.stringify([left, right]))\n```" },
            { text: "shared-sub-answer" },
            submitAnswer("done")
          ],
          modelMetrics,
          config: { maxDepth: 0 }
        })),
        Effect.timeout("12 seconds")
      )
    )

    const eventList = Chunk.toReadonlyArray(events)
    const cacheHitCount = eventList.filter((event) =>
      event._tag === "CacheHit" && event.kind === "subcall"
    ).length
    const cacheMissCount = eventList.filter((event) =>
      event._tag === "CacheMiss" && event.kind === "subcall"
    ).length
    const execCompleted = eventList.find(
      (event): event is Extract<typeof event, { _tag: "CodeExecutionCompleted" }> =>
        event._tag === "CodeExecutionCompleted"
    )

    expect(execCompleted).toBeDefined()
    expect(execCompleted!.output).toContain("[\"shared-sub-answer\",\"shared-sub-answer\"]")
    expect(cacheHitCount).toBeGreaterThanOrEqual(1)
    expect(cacheMissCount).toBeGreaterThanOrEqual(1)
    expect(modelMetrics.calls).toBe(3)
    expect(modelMetrics.isSubCalls?.filter((value) => value === true).length).toBe(1)
  }, 20_000)

  test("concurrent duplicate recursive llm_query calls complete without scheduler deadlock", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      isSubCalls: []
    }

    const events = await Effect.runPromise(
      stream({
        query: "recursive cache dedup",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nconst [left, right] = await Promise.all([\n  llm_query('same recursive query', 'same recursive context'),\n  llm_query('same recursive query', 'same recursive context')\n])\nprint(left + '|' + right)\n```" },
            submitAnswer("recursive-sub-answer"),
            submitAnswer("done")
          ],
          modelMetrics,
          config: { maxDepth: 2 }
        })),
        Effect.timeout("15 seconds")
      )
    )

    const eventList = Chunk.toReadonlyArray(events)
    const cacheHitCount = eventList.filter((event) =>
      event._tag === "CacheHit" && event.kind === "subcall"
    ).length
    const cacheMissCount = eventList.filter((event) =>
      event._tag === "CacheMiss" && event.kind === "subcall"
    ).length
    const execCompleted = eventList.find(
      (event): event is Extract<typeof event, { _tag: "CodeExecutionCompleted" }> =>
        event._tag === "CodeExecutionCompleted" && event.callId === "root"
    )
    const finalized = eventList.find(
      (event): event is Extract<typeof event, { _tag: "CallFinalized" }> =>
        event._tag === "CallFinalized" && event.callId === "root"
    )

    expect(execCompleted).toBeDefined()
    expect(execCompleted!.output).toContain("recursive-sub-answer|recursive-sub-answer")
    expect(finalized).toBeDefined()
    expect(finalized!.answer).toBe("done")
    expect(cacheHitCount).toBeGreaterThanOrEqual(1)
    expect(cacheMissCount).toBeGreaterThanOrEqual(1)
    expect(modelMetrics.calls).toBe(3)
    expect(modelMetrics.depths.some((depth) => depth === 1)).toBe(true)
  }, 25_000)

  test("llm_query responseFormat cache hit preserves parsed object values", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      isSubCalls: []
    }

    const events = await Effect.runPromise(
      stream({
        query: "structured cache hit",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nconst schema = { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] }\nconst first = await llm_query('Extract actor', 'Alice is a researcher', { responseFormat: { type: 'json', schema } })\nconst second = await llm_query('Extract actor', 'Alice is a researcher', { responseFormat: { type: 'json', schema } })\nprint(`${typeof first}|${typeof second}|${first.name}|${second.name}`)\n```" },
            { text: "{\"name\":\"Alice\"}" },
            submitAnswer("done")
          ],
          modelMetrics,
          config: { maxDepth: 0 }
        })),
        Effect.timeout("12 seconds")
      )
    )

    const eventList = Chunk.toReadonlyArray(events)
    const cacheHitCount = eventList.filter((event) =>
      event._tag === "CacheHit" && event.kind === "subcall"
    ).length
    const execCompleted = eventList.find(
      (event): event is Extract<typeof event, { _tag: "CodeExecutionCompleted" }> =>
        event._tag === "CodeExecutionCompleted"
    )

    expect(execCompleted).toBeDefined()
    expect(execCompleted!.output).toBe("object|object|Alice|Alice")
    expect(cacheHitCount).toBeGreaterThanOrEqual(1)
    expect(modelMetrics.calls).toBe(3)
  }, 20_000)

  test("cache hit does not consume an extra llm call budget slot", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      isSubCalls: []
    }

    const answer = await Effect.runPromise(
      complete({
        query: "budget with cache hit",
        context: "ctx"
      }).pipe(
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nconst first = await llm_query('budget query', 'budget context')\nconst second = await llm_query('budget query', 'budget context')\nprint(first + '|' + second)\n```" },
            { text: "budget-answer" },
            submitAnswer("done")
          ],
          modelMetrics,
          config: {
            maxDepth: 0,
            maxLlmCalls: 3
          }
        })),
        Effect.timeout("12 seconds")
      )
    )

    expect(answer).toBe("done")
    expect(modelMetrics.calls).toBe(3)
  }, 20_000)

  test("cache disabled runs duplicate llm_query calls without cache events", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      isSubCalls: []
    }

    const events = await Effect.runPromise(
      stream({
        query: "cache disabled",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nconst first = await llm_query('same query', 'same context')\nconst second = await llm_query('same query', 'same context')\nprint(first + '|' + second)\n```" },
            { text: "first-sub-answer" },
            { text: "second-sub-answer" },
            submitAnswer("done")
          ],
          modelMetrics,
          config: {
            maxDepth: 0,
            cache: { enabled: false }
          }
        })),
        Effect.timeout("12 seconds")
      )
    )

    const eventList = Chunk.toReadonlyArray(events)
    const execCompleted = eventList.find(
      (event): event is Extract<typeof event, { _tag: "CodeExecutionCompleted" }> =>
        event._tag === "CodeExecutionCompleted"
    )

    expect(execCompleted).toBeDefined()
    expect(execCompleted!.output).toContain("first-sub-answer|second-sub-answer")
    expect(eventList.some((event) => event._tag === "CacheHit" || event._tag === "CacheMiss")).toBe(false)
    expect(modelMetrics.calls).toBe(4)
  }, 20_000)

  test("llm_query_batched preserves result order and routes as sub-calls", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      isSubCalls: []
    }

    const answer = await Effect.runPromise(
      complete({
        query: "batch ordering",
        context: "ctx"
      }).pipe(
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nconst results = await llm_query_batched(['q1', 'q2'], ['c1', 'c2'])\nprint(JSON.stringify(results))\n```" },
            { text: "first-result" },
            { text: "second-result" },
            submitAnswer("done")
          ],
          modelMetrics
        })),
        Effect.timeout("10 seconds")
      )
    )

    expect(answer).toBe("done")
    expect(modelMetrics.isSubCalls?.filter((value) => value === true).length).toBe(2)

    const finalPrompt = modelMetrics.prompts[modelMetrics.prompts.length - 1]!
    const userMessages = finalPrompt.content.filter((m) => m.role === "user")
    const lastUserMsg = userMessages[userMessages.length - 1]!
    const lastUserText = lastUserMsg.role === "user"
      ? (lastUserMsg.content as ReadonlyArray<{ readonly text: string }>)[0]!.text
      : ""
    expect(lastUserText).toContain("[\"first-result\",\"second-result\"]")
  }, 15_000)

  test("llm_query_batched rejects empty query items before dispatch", async () => {
    const events = await Effect.runPromise(
      stream({
        query: "batch query validation",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\ntry {\n  await llm_query_batched(['q1', ''], ['c1', 'c2'])\n} catch (e) {\n  print('caught: ' + e.message)\n}\n```" },
            submitAnswer("done")
          ]
        })),
        Effect.timeout("10 seconds")
      )
    )

    const eventList = Chunk.toReadonlyArray(events)
    const execCompleted = eventList.find(
      (event): event is Extract<typeof event, { _tag: "CodeExecutionCompleted" }> =>
        event._tag === "CodeExecutionCompleted"
    )

    expect(execCompleted).toBeDefined()
    expect(execCompleted!.output).toContain("llm_query_batched query at index 1 must be non-empty")
    expect(eventList.some((event) => event._tag === "CallFailed")).toBe(false)
  }, 15_000)

  test("llm_query_batched fails fast on budget exhaustion", async () => {
    const events = await Effect.runPromise(
      stream({
        query: "batch budget failure",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nconst results = await llm_query_batched(['q1', 'q2'], ['c1', 'c2'])\nprint(results)\n```" },
            { text: "first-result" }
          ],
          config: {
            maxLlmCalls: 2
          }
        })),
        Effect.timeout("10 seconds")
      )
    )

    const eventList = Chunk.toReadonlyArray(events)
    const execCompleted = eventList.find(
      (event): event is Extract<typeof event, { _tag: "CodeExecutionCompleted" }> =>
        event._tag === "CodeExecutionCompleted"
    )
    expect(execCompleted).toBeDefined()
    expect(execCompleted!.output).toContain("llm_query_batched item 1 failed")

    const callFailed = eventList.find((event) => event._tag === "CallFailed")
    expect(callFailed).toBeDefined()
  }, 15_000)

  test("context and query are injected into __vars before code execution", async () => {
    const events = await Effect.runPromise(
      stream({
        query: "what is the answer",
        context: "the answer is 42"
      }).pipe(
        Stream.runCollect,
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nprint(__vars.query + '|' + __vars.context)\n```" },
            submitAnswer("done")
          ]
        })),
        Effect.timeout("10 seconds")
      )
    )

    const eventList = Chunk.toReadonlyArray(events)
    const execCompleted = eventList.find(
      (e): e is Extract<typeof e, { _tag: "CodeExecutionCompleted" }> =>
        e._tag === "CodeExecutionCompleted"
    )
    expect(execCompleted).toBeDefined()
    expect(execCompleted!.output).toBe("what is the answer|the answer is 42")
  }, 15_000)

  test("context metadata is injected into __vars.contextMeta and included in first prompt", async () => {
    const csvContext = "id,name\n1,Alice\n2,Bob"
    const modelMetrics: FakeModelMetrics = { calls: 0, prompts: [], depths: [] }

    const events = await Effect.runPromise(
      stream({
        query: "inspect metadata",
        context: csvContext,
        contextMetadata: analyzeContext(csvContext, "people.csv")
      }).pipe(
        Stream.runCollect,
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nprint(JSON.stringify(__vars.contextMeta))\n```" },
            submitAnswer("done")
          ],
          modelMetrics
        })),
        Effect.timeout("10 seconds")
      )
    )

    const eventList = Chunk.toReadonlyArray(events)
    const execCompleted = eventList.find(
      (e): e is Extract<typeof e, { _tag: "CodeExecutionCompleted" }> =>
        e._tag === "CodeExecutionCompleted"
    )
    expect(execCompleted).toBeDefined()

    const contextMeta = JSON.parse(execCompleted!.output) as {
      readonly fileName?: string
      readonly format?: string
      readonly lines?: number
      readonly recordCount?: number
      readonly fields?: ReadonlyArray<string>
    }
    expect(contextMeta.fileName).toBe("people.csv")
    expect(contextMeta.format).toBe("csv")
    expect(contextMeta.lines).toBe(3)
    expect(contextMeta.recordCount).toBe(2)
    expect(contextMeta.fields).toEqual(["id", "name"])

    const firstPrompt = modelMetrics.prompts[0]!
    const firstUserMessage = firstPrompt.content.find((m) => m.role === "user")
    const firstUserText = firstUserMessage?.role === "user"
      ? (firstUserMessage.content as ReadonlyArray<{ readonly text: string }>)[0]!.text
      : ""
    expect(firstUserText).toContain("Source: people.csv")
    expect(firstUserText).toContain("Format: CSV")
    expect(firstUserText).toContain("Fields: id, name")
  }, 15_000)

  test("llm_query with responseFormat returns parsed JSON object via one-shot path", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      isSubCalls: []
    }

    const answer = await Effect.runPromise(
      complete({
        query: "structured output test",
        context: "ctx"
      }).pipe(
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nconst result = await llm_query('Extract actors', 'Alice is a researcher', { responseFormat: { type: 'json', schema: { type: 'object', properties: { actors: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } } }, required: ['actors'] } } })\n__vars.extracted = result\nprint(typeof result)\n```" },
            { text: '{"actors": [{"name": "Alice"}]}' },
            submitAnswer("done")
          ],
          modelMetrics,
          config: { maxDepth: 0 }
        })),
        Effect.timeout("10 seconds")
      )
    )

    expect(answer).toBe("done")
    // The sub-call (second model call) should use the JSON system prompt
    const subCallPrompt = modelMetrics.prompts[1]!
    const systemMessages = subCallPrompt.content.filter((m) => m.role === "system")
    const systemText = systemMessages.map((m) =>
      m.role === "system"
        ? (typeof m.content === "string" ? m.content : (m.content as ReadonlyArray<{ readonly text: string }>)[0]?.text ?? "")
        : ""
    ).join(" ")
    expect(systemText).toContain("Required JSON Schema")
    expect(systemText).toContain("valid JSON")
    // The sub-call should be marked as a sub-call at depth 1
    expect(modelMetrics.isSubCalls?.[1]).toBe(true)
    expect(modelMetrics.depths[1]).toBe(1)
  }, 15_000)

  test("llm_query with responseFormat rejects malformed JSON from model", async () => {
    const events = await Effect.runPromise(
      stream({
        query: "bad json test",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.map(Chunk.toArray),
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\ntry {\n  const result = await llm_query('Extract', 'data', { responseFormat: { type: 'json', schema: { type: 'object', properties: { x: { type: 'number' } }, required: ['x'] } } })\n  print('got: ' + JSON.stringify(result))\n} catch (e) {\n  print('error: ' + e.message)\n}\n```" },
            { text: "This is not valid JSON at all" },
            { text: "This is still not valid JSON" },
            submitAnswer("handled")
          ],
          config: { maxDepth: 0 }
        })),
        Effect.timeout("10 seconds")
      )
    )

    const execCompleted = events.find(
      (event) => event._tag === "CodeExecutionCompleted"
    ) as { _tag: "CodeExecutionCompleted"; output: string } | undefined
    expect(execCompleted).toBeDefined()
    expect(execCompleted!.output).toContain("error:")
    expect(execCompleted!.output).toContain("Failed to parse JSON")
  }, 15_000)

  test("llm_query with responseFormat rejects markdown-wrapped JSON from model in strict mode", async () => {
    const events = await Effect.runPromise(
      stream({
        query: "strict json test",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.map(Chunk.toArray),
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\ntry {\n  const result = await llm_query('Extract', 'data', { responseFormat: { type: 'json', schema: { type: 'object', properties: { x: { type: 'number' } }, required: ['x'] } } })\n  print('got: ' + JSON.stringify(result))\n} catch (e) {\n  print('error: ' + e.message)\n}\n```" },
            { text: "```json\n{\"x\": 1}\n```" },
            submitAnswer("handled")
          ],
          config: { maxDepth: 0 }
        })),
        Effect.timeout("10 seconds")
      )
    )

    const execCompleted = events.find(
      (event) => event._tag === "CodeExecutionCompleted"
    ) as { _tag: "CodeExecutionCompleted"; output: string } | undefined
    expect(execCompleted).toBeDefined()
    expect(execCompleted!.output).toContain("error:")
    expect(execCompleted!.output).toContain("Failed to parse JSON")
  }, 15_000)

  test("llm_query with responseFormat rejects schema validation failures", async () => {
    const events = await Effect.runPromise(
      stream({
        query: "schema mismatch test",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.map(Chunk.toArray),
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\ntry {\n  const result = await llm_query('Extract', 'data', { responseFormat: { type: 'json', schema: { type: 'object', properties: { count: { type: 'number' } }, required: ['count'] } } })\n  print('got: ' + JSON.stringify(result))\n} catch (e) {\n  print('error: ' + e.message)\n}\n```" },
            { text: '{"name": "Alice"}' },
            { text: '{"name": "Alice again"}' },
            submitAnswer("handled")
          ],
          config: { maxDepth: 0 }
        })),
        Effect.timeout("10 seconds")
      )
    )

    const execCompleted = events.find(
      (event) => event._tag === "CodeExecutionCompleted"
    ) as { _tag: "CodeExecutionCompleted"; output: string } | undefined
    expect(execCompleted).toBeDefined()
    expect(execCompleted!.output).toContain("error:")
    expect(execCompleted!.output).toContain("schema validation failed")
  }, 15_000)

  test("llm_query with invalid responseFormat option rejects before model call", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      isSubCalls: []
    }

    const events = await Effect.runPromise(
      stream({
        query: "invalid format test",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.map(Chunk.toArray),
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\ntry {\n  const result = await llm_query('Extract', 'data', { responseFormat: { type: 'xml' } })\n  print('got: ' + result)\n} catch (e) {\n  print('error: ' + e.message)\n}\n```" },
            submitAnswer("handled")
          ],
          modelMetrics,
          config: { maxDepth: 0 }
        })),
        Effect.timeout("10 seconds")
      )
    )

    const execCompleted = events.find(
      (event) => event._tag === "CodeExecutionCompleted"
    ) as { _tag: "CodeExecutionCompleted"; output: string } | undefined
    expect(execCompleted).toBeDefined()
    expect(execCompleted!.output).toContain("error:")
    expect(execCompleted!.output).toContain("responseFormat")
    // Only 2 model calls: the main REPL iteration + the final SUBMIT, no sub-call
    expect(modelMetrics.calls).toBe(2)
  }, 15_000)

  test("recursive sub-call with responseFormat validates output against schema", async () => {
    const events = await Effect.runPromise(
      stream({
        query: "recursive schema validation test",
        context: "ctx"
      }).pipe(
        Stream.runCollect,
        Effect.map(Chunk.toArray),
        Effect.provide(makeRealSandboxLayers({
          responses: [
            // Root call: code with llm_query + responseFormat requiring { count: number }
            { text: "```js\ntry {\n  const result = await llm_query('Extract count', 'data', { responseFormat: { type: 'json', schema: { type: 'object', properties: { count: { type: 'number' } }, required: ['count'] } } })\n  print('got: ' + JSON.stringify(result))\n} catch (e) {\n  print('error: ' + e.message)\n}\n```" },
            // Sub-call iter 1: sets a mismatched value (string instead of number for count)
            { text: "```js\n__vars.result = { name: 'Alice' }\n```" },
            // Sub-call iter 2: SUBMIT with the wrong-schema value
            { toolCalls: [{ name: "SUBMIT", params: { variable: "result" } }] },
            // Root call iter 2: sees the error, submits
            submitAnswer("handled")
          ],
          config: { maxDepth: 2 }
        })),
        Effect.timeout("15 seconds")
      )
    )

    // The root call's code execution should receive the schema validation error
    // via the rejected llm_query bridge promise
    const execEvents = events.filter(
      (event) => event._tag === "CodeExecutionCompleted"
    ) as Array<{ _tag: "CodeExecutionCompleted"; output: string; callId: string }>
    // Find the root call execution (not sub-call)
    const rootExec = execEvents.find((e) => e.callId === "root")
    expect(rootExec).toBeDefined()
    expect(rootExec!.output).toContain("error:")
    expect(rootExec!.output).toContain("schema validation failed")
  }, 20_000)

  test("recursive sub-call with responseFormat passes outputJsonSchema to child call", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      isSubCalls: []
    }

    const answer = await Effect.runPromise(
      complete({
        query: "recursive structured test",
        context: "ctx"
      }).pipe(
        Effect.provide(makeRealSandboxLayers({
          responses: [
            // Root call, iter 1: code with llm_query that has responseFormat
            { text: "```js\nconst result = await llm_query('Extract actors', 'Alice is a researcher', { responseFormat: { type: 'json', schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } } })\n__vars.result = result\nprint(JSON.stringify(result))\n```" },
            // Sub-call at depth 1, iter 1: code that sets a var
            { text: "```js\n__vars.result = { name: 'Alice' }\n```" },
            // Sub-call at depth 1, iter 2: SUBMIT tool call to finalize
            { toolCalls: [{ name: "SUBMIT", params: { variable: "result" } }] },
            // Root call, iter 2: sees "{ name: 'Alice' }" printed, submit answer
            submitAnswer("done")
          ],
          modelMetrics,
          config: { maxDepth: 2 }
        })),
        Effect.timeout("15 seconds")
      )
    )

    expect(answer).toBe("done")
    // Sub-call should have been started recursively (not one-shot) at depth 1
    expect(modelMetrics.depths.some((d) => d === 1)).toBe(true)
  }, 20_000)

  test("llm_query named model routes through one-shot sub-call with selected model", async () => {
    const modelMetrics: FakeModelMetrics = {
      calls: 0,
      prompts: [],
      depths: [],
      isSubCalls: [],
      namedModels: []
    }

    const answer = await Effect.runPromise(
      complete({
        query: "named model routing",
        context: "ctx"
      }).pipe(
        Effect.provide(makeRealSandboxLayers({
          responses: [
            { text: "```js\nconst result = await llm_query('sub-query', 'sub-context', { model: 'fast' })\nprint(result)\n```" },
            { text: "named-sub-result" },
            submitAnswer("done")
          ],
          modelMetrics,
          config: {
            maxDepth: 3,
            namedModels: {
              fast: { provider: "openai", model: "gpt-4o-mini" }
            }
          }
        })),
        Effect.timeout("10 seconds")
      )
    )

    expect(answer).toBe("done")
    expect(modelMetrics.calls).toBe(3)
    expect(modelMetrics.depths[1]).toBe(1)
    expect(modelMetrics.isSubCalls?.[1]).toBe(true)
    expect(modelMetrics.namedModels?.[1]).toBe("fast")

    const oneShotPrompt = modelMetrics.prompts[1]!
    const systemText = oneShotPrompt.content
      .filter((m) => m.role === "system")
      .map((m) =>
        m.role === "system"
          ? (typeof m.content === "string" ? m.content : (m.content as ReadonlyArray<{ readonly text: string }>)[0]?.text ?? "")
          : ""
      )
      .join(" ")
    expect(systemText).toContain("Answer the query directly and concisely.")
  }, 15_000)
})
