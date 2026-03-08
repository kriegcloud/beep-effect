import { Effect, Layer, Schema, Stream } from "effect"

import { InferenceRuntimeError } from "./Errors.js"
import { ScoredOutput } from "./FormatType.js"
import type { PrimedCachePolicy } from "./PrimedCache.js"
import type { ProviderSchema } from "./ProviderSchema.js"

export class ModelConfig extends Schema.Class<ModelConfig>("ModelConfig")({
  modelId: Schema.optionalWith(Schema.String, { exact: true }),
  provider: Schema.optionalWith(Schema.String, { exact: true }),
  providerKwargs: Schema.optionalWith(
    Schema.Record({ key: Schema.String, value: Schema.Unknown }),
    { default: () => ({}) as const }
  )
}) {}

export interface InferOptions {
  readonly cachePolicy?: PrimedCachePolicy | undefined
  readonly providerConcurrency?: number | undefined
  readonly providerOptions?: Record<string, unknown> | undefined
  readonly passNumber?: number | undefined
  readonly contextWindowChars?: number | undefined
  readonly additionalContextHash?: string | undefined
  readonly preferStructuredOutput?: boolean | undefined
  readonly structuredOutput?: {
    readonly schema: Schema.Schema<any, any, never>
    readonly objectName?: string | undefined
  } | undefined
  readonly stream?: boolean | undefined
}

export interface LanguageModelService {
  readonly infer: (
    batchPrompts: ReadonlyArray<string>,
    options?: InferOptions
  ) => Effect.Effect<ReadonlyArray<ReadonlyArray<ScoredOutput>>, InferenceRuntimeError>

  readonly generateText: (
    prompt: string,
    options?: InferOptions
  ) => Effect.Effect<ScoredOutput, InferenceRuntimeError>

  readonly generateObject: (
    prompt: string,
    options?: InferOptions
  ) => Effect.Effect<Record<string, unknown>, InferenceRuntimeError>

  readonly streamText: (
    prompt: string,
    options?: InferOptions
  ) => Stream.Stream<string, InferenceRuntimeError>

  readonly modelId: string
  readonly requiresFenceOutput: boolean
  readonly schema: ProviderSchema | undefined
}

export interface LanguageModelFixture {
  readonly text?: string | undefined
  readonly object?: Record<string, unknown> | undefined
  readonly streamChunks?: ReadonlyArray<string> | undefined
  readonly score?: number | undefined
}

export interface LanguageModelFixtureOptions {
  readonly provider?: string | undefined
  readonly modelId?: string | undefined
  readonly requiresFenceOutput?: boolean | undefined
  readonly defaultText?: string | undefined
  readonly fixtures?: Readonly<Record<string, LanguageModelFixture>> | undefined
}

const JsonString = Schema.parseJson()
const JsonRecord = Schema.Record({ key: Schema.String, value: Schema.Unknown })

const makeDefaultScoredOutput = (
  provider: string,
  output: string,
  score: number
): ScoredOutput =>
  new ScoredOutput({
    provider,
    output,
    score
  })

const parseObjectFromText = (
  provider: string,
  text: string
): Effect.Effect<Record<string, unknown>, InferenceRuntimeError> =>
  Schema.decodeUnknown(JsonString)(text).pipe(
    Effect.flatMap((decoded) => Schema.decodeUnknown(JsonRecord)(decoded)),
    Effect.mapError(
      (error) =>
        new InferenceRuntimeError({
          provider,
          message: `Failed to decode model JSON object: ${String(error)}`
        })
    )
  )

export const makeStaticLanguageModel = (options?: {
  readonly provider?: string
  readonly modelId?: string
  readonly requiresFenceOutput?: boolean
}): LanguageModelService => ({
  modelId: options?.modelId ?? "test-model",
  requiresFenceOutput: options?.requiresFenceOutput ?? false,
  schema: undefined,
  infer: (batchPrompts) =>
    Effect.succeed(
      batchPrompts.map((prompt) => [
        makeDefaultScoredOutput(options?.provider ?? "test", prompt, 1)
      ])
    ),
  generateText: (prompt) =>
    Effect.succeed(
      makeDefaultScoredOutput(options?.provider ?? "test", prompt, 1)
    ),
  generateObject: (_prompt) => Effect.succeed({}),
  streamText: (prompt) => Stream.succeed(prompt)
})

export const makeFixtureLanguageModel = (
  options?: LanguageModelFixtureOptions
): LanguageModelService => {
  const provider = options?.provider ?? "test"
  const fixtures = options?.fixtures ?? {}

  const resolveFixture = (prompt: string): LanguageModelFixture | undefined =>
    fixtures[prompt]

  const resolveText = (prompt: string): { readonly text: string; readonly score: number } => {
    const fixture = resolveFixture(prompt)
    return {
      text: fixture?.text ?? options?.defaultText ?? prompt,
      score: fixture?.score ?? 1
    }
  }

  return {
    modelId: options?.modelId ?? "test-model",
    requiresFenceOutput: options?.requiresFenceOutput ?? false,
    schema: undefined,
    infer: (batchPrompts) =>
      Effect.succeed(
        batchPrompts.map((prompt) => {
          const resolved = resolveText(prompt)
          return [makeDefaultScoredOutput(provider, resolved.text, resolved.score)]
        })
      ),
    generateText: (prompt) => {
      const resolved = resolveText(prompt)
      return Effect.succeed(
        makeDefaultScoredOutput(provider, resolved.text, resolved.score)
      )
    },
    generateObject: (prompt) => {
      const fixture = resolveFixture(prompt)
      if (fixture?.object !== undefined) {
        return Effect.succeed(fixture.object)
      }

      const resolved = resolveText(prompt)
      return parseObjectFromText(provider, resolved.text).pipe(
        Effect.catchAll(() => Effect.succeed({}))
      )
    },
    streamText: (prompt) => {
      const fixture = resolveFixture(prompt)
      if (fixture?.streamChunks !== undefined) {
        return Stream.fromIterable(fixture.streamChunks)
      }

      const resolved = resolveText(prompt)
      return Stream.succeed(resolved.text)
    }
  }
}

export class LanguageModel extends Effect.Service<LanguageModel>()(
  "@effect-langextract/LanguageModel",
  {
    sync: () => makeStaticLanguageModel({ provider: "test", modelId: "test-model" })
  }
) {
  static readonly Test: Layer.Layer<LanguageModel> = Layer.succeed(
    LanguageModel,
    LanguageModel.make(
      makeStaticLanguageModel({
        provider: "test",
        modelId: "test-model"
      })
    )
  )

  static testLayer = (options?: LanguageModelFixtureOptions): Layer.Layer<LanguageModel> =>
    Layer.succeed(LanguageModel, LanguageModel.make(makeFixtureLanguageModel(options)))
}

export const makeStaticLanguageModelLayer = (options?: {
  readonly provider?: string
  readonly modelId?: string
  readonly requiresFenceOutput?: boolean
}): Layer.Layer<LanguageModel> =>
  Layer.succeed(LanguageModel, LanguageModel.make(makeStaticLanguageModel(options)))

export const LanguageModelTest: Layer.Layer<LanguageModel> = LanguageModel.Test
