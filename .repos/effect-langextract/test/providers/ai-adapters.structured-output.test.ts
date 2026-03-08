import * as NativeLanguageModel from "@effect/ai/LanguageModel"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Ref, Schema, Stream } from "effect"

import { PrimedCache, PrimedCachePolicy, RuntimeControl } from "../../src/index.js"
import { makeProviderLanguageModelService } from "../../src/providers/AiAdapters.js"

const makeNoopCache = () =>
  PrimedCache.make({
    get: () => Effect.succeed(undefined),
    put: () => Effect.void,
    invalidate: () => Effect.void,
    clearNamespace: () => Effect.void
  })

const makeCapturingCache = () =>
  Effect.gen(function* () {
    const captured = yield* Ref.make<
      Array<{ readonly key: Record<string, unknown>; readonly options: Record<string, unknown> }>
    >([])

    const cache = PrimedCache.make({
      get: (key, options) =>
        Ref.update(captured, (state) => [
          ...state,
          {
            key: key as unknown as Record<string, unknown>,
            options: (options ?? {}) as Record<string, unknown>
          }
        ]).pipe(Effect.as(undefined)),
      put: (key, _value, options) =>
        Ref.update(captured, (state) => [
          ...state,
          {
            key: key as unknown as Record<string, unknown>,
            options: (options ?? {}) as Record<string, unknown>
          }
        ]).pipe(Effect.asVoid),
      invalidate: () => Effect.void,
      clearNamespace: () => Effect.void
    })

    return { cache, captured } as const
  })

describe("AiAdapters structured output", () => {
  it.effect("forwards schema/objectName to native generateObject when provided", () =>
    Effect.gen(function* () {
      const captured = yield* Ref.make<Array<Record<string, unknown>>>([])

      const nativeModel = {
        generateText: ({ prompt }: { readonly prompt?: string }) =>
          Effect.succeed({ text: String(prompt ?? "") }),
        generateObject: (options: Record<string, unknown>) =>
          Ref.update(captured, (state) => [...state, options]).pipe(
            Effect.as({ value: { ok: true } })
          ),
        streamText: () => Stream.empty
      } as unknown as NativeLanguageModel.Service

      const service = makeProviderLanguageModelService({
        provider: "test-provider",
        modelId: "test-model",
        cache: makeNoopCache(),
        runtimeControl: RuntimeControl.make({
          withProviderPermit: (_provider, effect) => effect
        }),
        nativeModel,
        defaultProviderConcurrency: 1
      })

      const targetSchema = Schema.Struct({
        extractions: Schema.Array(
          Schema.Struct({
            extractionClass: Schema.String,
            extractionText: Schema.String,
            data: Schema.Unknown
          })
        )
      })

      const value = yield* service.generateObject("extract", {
        structuredOutput: {
          schema: targetSchema,
          objectName: "target"
        }
      })

      expect(value).toEqual({ ok: true })
      const recorded = (yield* Ref.get(captured))[0]
      expect(recorded?.schema).toBe(targetSchema)
      expect(recorded?.objectName).toBe("target")
    })
  )

  it.effect("uses default record schema when structuredOutput is absent", () =>
    Effect.gen(function* () {
      const captured = yield* Ref.make<Array<Record<string, unknown>>>([])

      const nativeModel = {
        generateText: ({ prompt }: { readonly prompt?: string }) =>
          Effect.succeed({ text: String(prompt ?? "") }),
        generateObject: (options: Record<string, unknown>) =>
          Ref.update(captured, (state) => [...state, options]).pipe(
            Effect.as({ value: { ok: true } })
          ),
        streamText: () => Stream.empty
      } as unknown as NativeLanguageModel.Service

      const service = makeProviderLanguageModelService({
        provider: "test-provider",
        modelId: "test-model",
        cache: makeNoopCache(),
        runtimeControl: RuntimeControl.make({
          withProviderPermit: (_provider, effect) => effect
        }),
        nativeModel,
        defaultProviderConcurrency: 1
      })

      yield* service.generateObject("extract")

      const recorded = (yield* Ref.get(captured))[0]
      expect(recorded?.schema).toBeDefined()
      expect(recorded?.objectName).toBeUndefined()
    })
  )

  it.effect("propagates default provider metadata into cache key and deterministic flag", () =>
    Effect.gen(function* () {
      const { cache, captured } = yield* makeCapturingCache()

      const nativeModel = {
        generateText: ({ prompt }: { readonly prompt?: string }) =>
          Effect.succeed({ text: String(prompt ?? "") }),
        generateObject: () => Effect.succeed({ value: { ok: true } }),
        streamText: () => Stream.empty
      } as unknown as NativeLanguageModel.Service

      const service = makeProviderLanguageModelService({
        provider: "test-provider",
        modelId: "test-model",
        cache,
        runtimeControl: RuntimeControl.make({
          withProviderPermit: (_provider, effect) => effect
        }),
        nativeModel,
        defaultProviderConcurrency: 1,
        defaultProviderMetadata: {
          temperature: 0.7,
          formatType: "yaml"
        }
      })

      yield* service.generateText("extract", {
        cachePolicy: new PrimedCachePolicy({
          deterministicOnly: true,
          namespace: "schema-test"
        })
      })

      const [getCall, putCall] = yield* Ref.get(captured)
      expect(getCall?.key.temperature).toBe(0.7)
      expect(getCall?.key.formatType).toBe("yaml")
      expect(getCall?.options.isDeterministic).toBe(false)
      expect(putCall?.options.isDeterministic).toBe(false)
    })
  )

  it.effect("allows infer options to override default provider metadata", () =>
    Effect.gen(function* () {
      const { cache, captured } = yield* makeCapturingCache()

      const nativeModel = {
        generateText: ({ prompt }: { readonly prompt?: string }) =>
          Effect.succeed({ text: String(prompt ?? "") }),
        generateObject: () => Effect.succeed({ value: { ok: true } }),
        streamText: () => Stream.empty
      } as unknown as NativeLanguageModel.Service

      const service = makeProviderLanguageModelService({
        provider: "test-provider",
        modelId: "test-model",
        cache,
        runtimeControl: RuntimeControl.make({
          withProviderPermit: (_provider, effect) => effect
        }),
        nativeModel,
        defaultProviderConcurrency: 1,
        defaultProviderMetadata: {
          temperature: 0.7,
          formatType: "yaml"
        }
      })

      yield* service.generateText("extract", {
        providerOptions: {
          temperature: 0,
          formatType: "json"
        },
        cachePolicy: new PrimedCachePolicy({
          deterministicOnly: true,
          namespace: "schema-test"
        })
      })

      const [getCall, putCall] = yield* Ref.get(captured)
      expect(getCall?.key.temperature).toBe(0)
      expect(getCall?.key.formatType).toBe("json")
      expect(getCall?.options.isDeterministic).toBe(true)
      expect(putCall?.options.isDeterministic).toBe(true)
    })
  )

  it.effect("propagates default provider metadata for batched infer calls", () =>
    Effect.gen(function* () {
      const { cache, captured } = yield* makeCapturingCache()

      const nativeModel = {
        generateText: ({ prompt }: { readonly prompt?: string }) =>
          Effect.succeed({ text: String(prompt ?? "") }),
        generateObject: () => Effect.succeed({ value: { ok: true } }),
        streamText: () => Stream.empty
      } as unknown as NativeLanguageModel.Service

      const service = makeProviderLanguageModelService({
        provider: "test-provider",
        modelId: "test-model",
        cache,
        runtimeControl: RuntimeControl.make({
          withProviderPermit: (_provider, effect) => effect
        }),
        nativeModel,
        defaultProviderConcurrency: 2,
        defaultProviderMetadata: {
          temperature: 0.7,
          formatType: "yaml"
        }
      })

      yield* service.infer(["a", "b"], {
        cachePolicy: new PrimedCachePolicy({
          deterministicOnly: true,
          namespace: "schema-test"
        })
      })

      const calls = yield* Ref.get(captured)
      expect(calls).toHaveLength(4)
      for (const call of calls) {
        expect(call.key.temperature).toBe(0.7)
        expect(call.key.formatType).toBe("yaml")
        expect(call.options.isDeterministic).toBe(false)
      }
    })
  )

  it.effect("propagates default provider metadata through object fallback cache path", () =>
    Effect.gen(function* () {
      const { cache, captured } = yield* makeCapturingCache()

      const nativeModel = {
        generateText: () =>
          Effect.succeed({ text: JSON.stringify({ ok: true }) }),
        generateObject: () => Effect.fail(new Error("object generation failed")),
        streamText: () => Stream.empty
      } as unknown as NativeLanguageModel.Service

      const service = makeProviderLanguageModelService({
        provider: "test-provider",
        modelId: "test-model",
        cache,
        runtimeControl: RuntimeControl.make({
          withProviderPermit: (_provider, effect) => effect
        }),
        nativeModel,
        defaultProviderConcurrency: 1,
        defaultProviderMetadata: {
          temperature: 0.7,
          formatType: "yaml"
        }
      })

      const value = yield* service.generateObject("extract", {
        cachePolicy: new PrimedCachePolicy({
          deterministicOnly: true,
          namespace: "schema-test"
        })
      })

      expect(value).toEqual({ ok: true })
      const [getCall, putCall] = yield* Ref.get(captured)
      expect(getCall?.key.temperature).toBe(0.7)
      expect(getCall?.key.formatType).toBe("yaml")
      expect(getCall?.options.isDeterministic).toBe(false)
      expect(putCall?.options.isDeterministic).toBe(false)
    })
  )
})
