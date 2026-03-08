import { describe, expect, test } from "bun:test"
import * as KeyValueStore from "@effect/platform/KeyValueStore"
import { Effect, Layer, Option } from "effect"
import { LlmCallLive } from "../src/LlmCall"
import { RlmConfig, type RlmConfigService } from "../src/RlmConfig"
import { RlmRuntimeLive } from "../src/Runtime"
import { CallId } from "../src/RlmTypes"
import { runScheduler } from "../src/Scheduler"
import {
  RunTraceWriter,
  makeRunTraceWriter
} from "../src/RunTraceWriter"
import { BridgeStoreLive } from "../src/scheduler/BridgeStore"
import { makeFakeRlmModelLayer } from "./helpers/FakeRlmModel"
import { makeFakeSandboxFactoryLayer } from "./helpers/FakeSandboxFactory"

const makeMemoryStore = () =>
  Effect.provide(KeyValueStore.KeyValueStore, KeyValueStore.layerMemory)

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

const makeRuntimeWithBridgeStoreLayer = () =>
  Layer.fresh(
    Layer.merge(
      RlmRuntimeLive,
      Layer.provide(BridgeStoreLive, RlmRuntimeLive)
    )
  )

describe("RunTraceWriter", () => {
  test("writeMeta stores metadata at meta.json", async () => {
    const [rootStore, varsStore] = await Effect.runPromise(
      Effect.all([makeMemoryStore(), makeMemoryStore()])
    )
    const writer = makeRunTraceWriter({ rootStore, varsStore })

    await Effect.runPromise(
      writer.writeMeta({
        completionId: "completion-test",
        query: "summarize this",
        contextChars: 120,
        model: "test-model",
        maxIterations: 10,
        maxLlmCalls: 20,
        startedAt: "2026-02-10T00:00:00.000Z"
      })
    )

    const stored = await Effect.runPromise(rootStore.get("meta.json"))
    expect(Option.isSome(stored)).toBe(true)
    if (Option.isSome(stored)) {
      const parsed = JSON.parse(stored.value)
      expect(parsed.completionId).toBe("completion-test")
      expect(parsed.model).toBe("test-model")
    }
  })

  test("appendEvent appends NDJSON lines", async () => {
    const [rootStore, varsStore] = await Effect.runPromise(
      Effect.all([makeMemoryStore(), makeMemoryStore()])
    )
    const writer = makeRunTraceWriter({ rootStore, varsStore })

    await Effect.runPromise(
      writer.appendEvent({
        _tag: "CallStarted",
        completionId: "completion-test",
        callId: CallId("root"),
        depth: 0
      })
    )

    await Effect.runPromise(
      writer.appendEvent({
        _tag: "CodeExecutionCompleted",
        completionId: "completion-test",
        callId: CallId("root"),
        depth: 0,
        output: "ok"
      })
    )

    const stored = await Effect.runPromise(rootStore.get("transcript.ndjson"))
    expect(Option.isSome(stored)).toBe(true)
    if (Option.isSome(stored)) {
      const lines = stored.value.split("\n")
      expect(lines.length).toBe(2)
      expect(JSON.parse(lines[0]!)._tag).toBe("CallStarted")
      expect(JSON.parse(lines[1]!)._tag).toBe("CodeExecutionCompleted")
    }
  })

  test("writeVarSnapshot writes call/depth/iteration keyed file and truncates oversize payloads", async () => {
    const [rootStore, varsStore] = await Effect.runPromise(
      Effect.all([makeMemoryStore(), makeMemoryStore()])
    )
    const writer = makeRunTraceWriter({
      rootStore,
      varsStore,
      maxSnapshotBytes: 250
    })

    await Effect.runPromise(
      writer.writeVarSnapshot({
        callId: "root",
        depth: 0,
        iteration: 3,
        vars: {
          huge: "x".repeat(2_000),
          small: "value"
        }
      })
    )

    const stored = await Effect.runPromise(
      varsStore.get("call-root.depth-0.iter-003.json")
    )
    expect(Option.isSome(stored)).toBe(true)
    if (Option.isSome(stored)) {
      const parsed = JSON.parse(stored.value)
      expect(parsed.iteration).toBe(3)
      expect(parsed.vars.__trace_truncated__).toBeDefined()
    }
  })

  test("snapshot truncation uses small-first ordering and includes manifest", async () => {
    const [rootStore, varsStore] = await Effect.runPromise(
      Effect.all([makeMemoryStore(), makeMemoryStore()])
    )
    const writer = makeRunTraceWriter({
      rootStore,
      varsStore,
      maxSnapshotBytes: 400
    })

    await Effect.runPromise(
      writer.writeVarSnapshot({
        callId: "root",
        depth: 0,
        iteration: 1,
        vars: {
          huge: "x".repeat(2_000),
          tiny: 42,
          medium: "hello world",
          contextCorpusId: "feed"
        }
      })
    )

    const stored = await Effect.runPromise(
      varsStore.get("call-root.depth-0.iter-001.json")
    )
    expect(Option.isSome(stored)).toBe(true)
    if (Option.isSome(stored)) {
      const parsed = JSON.parse(stored.value)
      // Small variables should be included
      expect(parsed.vars.tiny).toBe(42)
      expect(parsed.vars.contextCorpusId).toBe("feed")
      // Huge variable should be truncated
      expect(parsed.vars.huge).toBeUndefined()
      // Truncation sentinel should be present
      expect(parsed.vars.__trace_truncated__).toBeDefined()
      // Manifest should list all variable names with sizes
      expect(parsed.__trace_manifest__).toBeDefined()
      expect(parsed.__trace_manifest__.tiny).toBeDefined()
      expect(parsed.__trace_manifest__.huge).toBeDefined()
      expect(parsed.__trace_manifest__.contextCorpusId).toBeDefined()
      expect(parsed.__trace_manifest__.medium).toBeDefined()
    }
  })

  test("default RunTraceWriter reference is no-op", async () => {
    await Effect.runPromise(
      Effect.gen(function*() {
        const writer = yield* RunTraceWriter
        yield* writer.writeMeta({
          completionId: "noop",
          query: "q",
          contextChars: 0,
          model: "m",
          maxIterations: 1,
          maxLlmCalls: 1,
          startedAt: "2026-02-10T00:00:00.000Z"
        })
        yield* writer.appendEvent({
          _tag: "CallStarted",
          completionId: "noop",
          callId: CallId("root"),
          depth: 0
        })
        yield* writer.writeVarSnapshot({
          callId: "root",
          depth: 0,
          iteration: 1,
          vars: {}
        })
        yield* writer.writeResult({
          source: "answer",
          answer: "ok"
        })
      })
    )
  })

  test("scheduler integration writes transcript, var snapshot, and result", async () => {
    const [rootStore, varsStore] = await Effect.runPromise(
      Effect.all([makeMemoryStore(), makeMemoryStore()])
    )

    const traceLayer = Layer.succeed(
      RunTraceWriter,
      makeRunTraceWriter({ rootStore, varsStore })
    )

    const core = Layer.mergeAll(
      makeFakeRlmModelLayer([
        { text: "```js\nconst value = 1\n```" },
        { toolCalls: [{ name: "SUBMIT", params: { answer: "done" } }] }
      ]),
      makeFakeSandboxFactoryLayer(),
      makeRuntimeWithBridgeStoreLayer(),
      traceLayer
    )
    const llmCallLayer = Layer.provideMerge(LlmCallLive, core)
    const layers = Layer.provideMerge(
      Layer.merge(core, llmCallLayer),
      Layer.succeed(RlmConfig, defaultConfig)
    )

    const result = await Effect.runPromise(
      runScheduler({
        query: "trace this run",
        context: "ctx"
      }).pipe(
        Effect.provide(layers)
      )
    )

    expect(result).toEqual({ source: "answer", answer: "done" })

    const transcript = await Effect.runPromise(rootStore.get("transcript.ndjson"))
    expect(Option.isSome(transcript)).toBe(true)
    if (Option.isSome(transcript)) {
      const lines = transcript.value.split("\n")
      expect(lines.some((line) => JSON.parse(line)._tag === "IterationStarted")).toBe(true)
      expect(lines.some((line) => JSON.parse(line)._tag === "CallFinalized")).toBe(true)

      const meta = await Effect.runPromise(rootStore.get("meta.json"))
      expect(Option.isSome(meta)).toBe(true)
      if (Option.isSome(meta)) {
        const metaCompletionId = JSON.parse(meta.value).completionId
        const transcriptCompletionIds = lines
          .filter((line) => line.trim().length > 0)
          .map((line) => JSON.parse(line).completionId)
        expect(transcriptCompletionIds.length).toBeGreaterThan(0)
        expect(new Set(transcriptCompletionIds).size).toBe(1)
        expect(transcriptCompletionIds[0]).toBe(metaCompletionId)
      }
    }

    const varsSnapshot = await Effect.runPromise(
      Effect.gen(function*() {
        for (let attempt = 0; attempt < 20; attempt += 1) {
          const snapshot = yield* varsStore.get("call-root.depth-0.iter-001.json")
          if (Option.isSome(snapshot)) return snapshot
          yield* Effect.sleep("10 millis")
        }
        return Option.none<string>()
      })
    )
    expect(Option.isSome(varsSnapshot)).toBe(true)

    const finalResult = await Effect.runPromise(rootStore.get("result.json"))
    expect(Option.isSome(finalResult)).toBe(true)
    if (Option.isSome(finalResult)) {
      expect(JSON.parse(finalResult.value).source).toBe("answer")
    }
  })
})
