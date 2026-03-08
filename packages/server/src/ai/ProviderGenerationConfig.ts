import * as Anthropic from "@effect/ai-anthropic"
import * as OpenAi from "@effect/ai-openai"
import { Effect, Option, Stream } from "effect"

export const toProviderConfigOverride = (
  provider: string,
  config: {
    readonly temperature?: number
    readonly maxOutputTokens?: number
    readonly topP?: number
  }
): Record<string, unknown> => {
  const overrides: Record<string, unknown> = {}
  if (config.temperature !== undefined) overrides.temperature = config.temperature
  if (config.topP !== undefined) overrides.top_p = config.topP

  switch (provider) {
    case "anthropic":
      if (config.maxOutputTokens !== undefined) overrides.max_tokens = config.maxOutputTokens
      break
    case "openai":
    case "openrouter":
    case "google":
      if (config.maxOutputTokens !== undefined) overrides.max_output_tokens = config.maxOutputTokens
      break
  }
  return overrides
}

export const applyProviderConfigOverrideToStream = (
  provider: string,
  overrides: Record<string, unknown>,
  stream: Stream.Stream<any, unknown, any>
): Stream.Stream<any, unknown, any> =>
  Stream.unwrap(
    Effect.gen(function*() {
      if (Object.keys(overrides).length === 0) {
        return stream
      }

      if (provider === "anthropic") {
        const existing = yield* Effect.serviceOption(Anthropic.AnthropicLanguageModel.Config)
        const mergedConfig = {
          ...(Option.isSome(existing) ? existing.value : {}),
          ...overrides
        }
        return stream.pipe(
          Stream.provideService(
            Anthropic.AnthropicLanguageModel.Config,
            mergedConfig as any
          )
        )
      }

      if (provider === "openai" || provider === "openrouter" || provider === "google") {
        const existing = yield* Effect.serviceOption(OpenAi.OpenAiLanguageModel.Config)
        const mergedConfig = {
          ...(Option.isSome(existing) ? existing.value : {}),
          ...overrides
        }
        return stream.pipe(
          Stream.provideService(
            OpenAi.OpenAiLanguageModel.Config,
            mergedConfig as any
          )
        )
      }

      return stream
    })
  )

export const applyProviderConfigOverrideToEffect = <A, E, R>(
  provider: string,
  overrides: Record<string, unknown>,
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> => {
  if (Object.keys(overrides).length === 0) {
    return effect
  }

  if (provider === "anthropic") {
    return Anthropic.AnthropicLanguageModel.withConfigOverride(overrides as any)(
      effect as any
    ) as Effect.Effect<A, E, R>
  }

  if (provider === "openai" || provider === "openrouter" || provider === "google") {
    return OpenAi.OpenAiLanguageModel.withConfigOverride(overrides as any)(
      effect as any
    ) as Effect.Effect<A, E, R>
  }

  return effect
}
