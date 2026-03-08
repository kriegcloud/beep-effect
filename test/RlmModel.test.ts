import { describe, expect, test } from "bun:test"
import * as LanguageModel from "@effect/ai/LanguageModel"
import * as Response from "@effect/ai/Response"
import { Effect, Stream } from "effect"
import { makeRlmModelLayer, RlmModel } from "../src/RlmModel"
import { ModelCallError } from "../src/RlmError"

const makeResponse = (text: string): LanguageModel.GenerateTextResponse<any> =>
  new LanguageModel.GenerateTextResponse<any>([
    Response.makePart("text", { text }),
    Response.makePart("finish", {
      reason: "stop" as const,
      usage: new Response.Usage({
        inputTokens: undefined,
        outputTokens: undefined,
        totalTokens: undefined
      })
    })
  ] as any)

const makeService = (label: string, calls: { count: number }): LanguageModel.Service => ({
  generateText: () => Effect.sync(() => {
    calls.count += 1
    return makeResponse(label)
  }),
  generateObject: () => Effect.die(`Unexpected generateObject(${label})`) as any,
  streamText: () => Stream.empty as any
})

const makeFailingService = (
  error: unknown,
  calls: { count: number }
): LanguageModel.Service => ({
  generateText: () => Effect.gen(function*() {
    calls.count += 1
    return yield* Effect.fail(error as any)
  }),
  generateObject: () => Effect.die("Unexpected generateObject") as any,
  streamText: () => Stream.empty as any
})

describe("RlmModel routing", () => {
  test("delegates only sub-calls that meet depth threshold", async () => {
    const primaryCalls = { count: 0 }
    const subCalls = { count: 0 }

    const layer = makeRlmModelLayer({
      primary: Effect.succeed(makeService("primary", primaryCalls)),
      sub: Effect.succeed(makeService("sub", subCalls)),
      subLlmDelegation: {
        enabled: true,
        depthThreshold: 1
      }
    })

    const rootText = await Effect.runPromise(
      Effect.gen(function*() {
        const model = yield* RlmModel
        const response = yield* model.generateText({
          prompt: "root" as any,
          depth: 1,
          isSubCall: false
        })
        return response.text
      }).pipe(Effect.provide(layer))
    )

    const subText = await Effect.runPromise(
      Effect.gen(function*() {
        const model = yield* RlmModel
        const response = yield* model.generateText({
          prompt: "sub" as any,
          depth: 1,
          isSubCall: true
        })
        return response.text
      }).pipe(Effect.provide(layer))
    )

    expect(rootText).toBe("primary")
    expect(subText).toBe("sub")
    expect(primaryCalls.count).toBe(1)
    expect(subCalls.count).toBe(1)
  })

  test("does not delegate when delegation is disabled", async () => {
    const primaryCalls = { count: 0 }
    const subCalls = { count: 0 }

    const layer = makeRlmModelLayer({
      primary: Effect.succeed(makeService("primary", primaryCalls)),
      sub: Effect.succeed(makeService("sub", subCalls)),
      subLlmDelegation: {
        enabled: false,
        depthThreshold: 1
      }
    })

    const text = await Effect.runPromise(
      Effect.gen(function*() {
        const model = yield* RlmModel
        const response = yield* model.generateText({
          prompt: "sub" as any,
          depth: 5,
          isSubCall: true
        })
        return response.text
      }).pipe(Effect.provide(layer))
    )

    expect(text).toBe("primary")
    expect(primaryCalls.count).toBe(1)
    expect(subCalls.count).toBe(0)
  })

  test("does not delegate sub-calls below threshold", async () => {
    const primaryCalls = { count: 0 }
    const subCalls = { count: 0 }

    const layer = makeRlmModelLayer({
      primary: Effect.succeed(makeService("primary", primaryCalls)),
      sub: Effect.succeed(makeService("sub", subCalls)),
      subLlmDelegation: {
        enabled: true,
        depthThreshold: 2
      }
    })

    const text = await Effect.runPromise(
      Effect.gen(function*() {
        const model = yield* RlmModel
        const response = yield* model.generateText({
          prompt: "sub" as any,
          depth: 1,
          isSubCall: true
        })
        return response.text
      }).pipe(Effect.provide(layer))
    )

    expect(text).toBe("primary")
    expect(primaryCalls.count).toBe(1)
    expect(subCalls.count).toBe(0)
  })

  test("routes explicit named model selections ahead of delegation", async () => {
    const primaryCalls = { count: 0 }
    const subCalls = { count: 0 }
    const fastCalls = { count: 0 }

    const layer = makeRlmModelLayer({
      primary: Effect.succeed(makeService("primary", primaryCalls)),
      sub: Effect.succeed(makeService("sub", subCalls)),
      named: {
        fast: Effect.succeed(makeService("fast", fastCalls))
      },
      subLlmDelegation: {
        enabled: true,
        depthThreshold: 1
      }
    })

    const text = await Effect.runPromise(
      Effect.gen(function*() {
        const model = yield* RlmModel
        const response = yield* model.generateText({
          prompt: "named" as any,
          depth: 5,
          isSubCall: true,
          namedModel: "fast"
        })
        return response.text
      }).pipe(Effect.provide(layer))
    )

    expect(text).toBe("fast")
    expect(primaryCalls.count).toBe(0)
    expect(subCalls.count).toBe(0)
    expect(fastCalls.count).toBe(1)
  })

  test("fails for unknown named model keys", async () => {
    const layer = makeRlmModelLayer({
      primary: Effect.succeed(makeService("primary", { count: 0 }))
    })

    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const model = yield* RlmModel
        return yield* Effect.either(model.generateText({
          prompt: "named" as any,
          depth: 0,
          namedModel: "missing"
        }))
      }).pipe(Effect.provide(layer))
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(ModelCallError)
      expect((result.left as ModelCallError).provider).toBe("unknown")
      expect((result.left as ModelCallError).model).toBe("missing")
      expect((result.left as ModelCallError).retryable).toBe(false)
    }
  })

  test("maps provider/model metadata into ModelCallError", async () => {
    const calls = { count: 0 }
    const layer = makeRlmModelLayer({
      primary: Effect.succeed(makeFailingService({ message: "gateway timeout", status: 504 }, calls)),
      primaryTarget: {
        provider: "openai",
        model: "gpt-test"
      }
    })

    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const model = yield* RlmModel
        return yield* Effect.either(model.generateText({
          prompt: "test" as any,
          depth: 0
        }))
      }).pipe(Effect.provide(layer))
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(ModelCallError)
      expect((result.left as ModelCallError).provider).toBe("openai")
      expect((result.left as ModelCallError).model).toBe("gpt-test")
      expect((result.left as ModelCallError).operation).toBe("generateText")
      expect((result.left as ModelCallError).retryable).toBe(true)
    }
    expect(calls.count).toBe(1)
  })
})
