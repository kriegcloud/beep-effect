import { Effect, Layer } from "effect"

import { Extraction } from "./Data.js"
import { AlignmentError } from "./Errors.js"
import { Resolver } from "./Resolver.js"

export interface AlignChunkOptions {
  readonly enableFuzzyAlignment?: boolean | undefined
  readonly fuzzyAlignmentThreshold?: number | undefined
  readonly acceptMatchLesser?: boolean | undefined
}

export interface AlignmentExecutorService {
  readonly alignChunk: (
    extractions: ReadonlyArray<Extraction>,
    sourceText: string,
    tokenOffset: number,
    charOffset: number,
    options?: AlignChunkOptions | undefined
  ) => Effect.Effect<ReadonlyArray<Extraction>, AlignmentError>
}

export class AlignmentExecutor extends Effect.Service<AlignmentExecutor>()(
  "@effect-langextract/AlignmentExecutor",
  {
    dependencies: [Resolver.Default],
    effect: Effect.gen(function* () {
      const resolver = yield* Resolver

      return {
        alignChunk: (
          extractions: ReadonlyArray<Extraction>,
          sourceText: string,
          tokenOffset: number,
          charOffset: number,
          options?: AlignChunkOptions | undefined
        ) => {
          const normalizedOptions =
            options === undefined
              ? undefined
              : {
                  ...(options.enableFuzzyAlignment !== undefined
                    ? {
                        enableFuzzyAlignment: options.enableFuzzyAlignment
                      }
                    : {}),
                  ...(options.fuzzyAlignmentThreshold !== undefined
                    ? {
                        fuzzyAlignmentThreshold:
                          options.fuzzyAlignmentThreshold
                      }
                    : {}),
                  ...(options.acceptMatchLesser !== undefined
                    ? {
                        acceptMatchLesser: options.acceptMatchLesser
                      }
                    : {})
                }

          return resolver.align(
            extractions,
            sourceText,
            tokenOffset,
            charOffset,
            normalizedOptions
          )
        }
      } satisfies AlignmentExecutorService
    })
  }
) {
  static readonly Test: Layer.Layer<AlignmentExecutor> = AlignmentExecutor.Default

  static testLayer = (
    service?: AlignmentExecutorService
  ): Layer.Layer<AlignmentExecutor, never, Resolver> =>
    service !== undefined
      ? Layer.succeed(AlignmentExecutor, AlignmentExecutor.make(service))
      : AlignmentExecutor.DefaultWithoutDependencies
}

export const AlignmentExecutorLive: Layer.Layer<AlignmentExecutor> =
  AlignmentExecutor.Default

export const AlignmentExecutorTest: Layer.Layer<AlignmentExecutor> =
  AlignmentExecutor.Test
