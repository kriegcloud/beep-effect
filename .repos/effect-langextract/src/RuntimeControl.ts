import {
  Cause,
  Clock,
  Effect,
  Layer,
  Option,
  PartitionedSemaphore,
  Queue,
  Stream
} from "effect"

export interface RuntimeControlService {
  readonly withProviderPermit: <A, E, R>(
    provider: string,
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E, R>
}

const makeNoopRuntimeControl = (): RuntimeControlService => ({
  withProviderPermit: (_provider, effect) => effect
})

const makePermitRuntimeControl = (
  maxConcurrency: number
): Effect.Effect<RuntimeControlService> =>
  Effect.gen(function* () {
    const permits = Math.max(1, maxConcurrency)
    const semaphore = yield* PartitionedSemaphore.make<string>({
      permits
    })

    const logRuntimeControlEvent = (
      message: string,
      fields: Readonly<Record<string, unknown>>
    ): Effect.Effect<void> =>
      Effect.logDebug(message).pipe(Effect.annotateLogs(fields))

    return {
      withProviderPermit: (provider, effect) =>
        Effect.gen(function* () {
          const waitStartedAt = yield* Clock.currentTimeMillis
          yield* logRuntimeControlEvent("langextract.runtime_control.permit_wait_start", {
            provider,
            permits
          })

          return yield* semaphore.withPermits(provider, 1)(
            Effect.gen(function* () {
              const acquiredAt = yield* Clock.currentTimeMillis
              yield* logRuntimeControlEvent("langextract.runtime_control.permit_acquired", {
                provider,
                permits,
                waitMs: Math.max(0, acquiredAt - waitStartedAt)
              })
              return yield* effect
            })
          ).pipe(
            Effect.tapError(() =>
              logRuntimeControlEvent("langextract.runtime_control.permit_failed", {
                provider
              })
            ),
            Effect.ensuring(
              Clock.currentTimeMillis.pipe(
                Effect.flatMap((releasedAt) =>
                  logRuntimeControlEvent(
                    "langextract.runtime_control.permit_released",
                    {
                      provider,
                      elapsedMs: Math.max(0, releasedAt - waitStartedAt)
                    }
                  )
                )
              )
            )
          )
        })
    } satisfies RuntimeControlService
  })

export class RuntimeControl extends Effect.Service<RuntimeControl>()(
  "@effect-langextract/RuntimeControl",
  {
    sync: makeNoopRuntimeControl
  }
) {
  static readonly Test: Layer.Layer<RuntimeControl> = RuntimeControl.Default

  static testLayer = (
    service?: RuntimeControlService
  ): Layer.Layer<RuntimeControl> =>
    Layer.succeed(
      RuntimeControl,
      RuntimeControl.make(service ?? makeNoopRuntimeControl())
    )
}

export const RuntimeControlLive: Layer.Layer<RuntimeControl> = RuntimeControl.Default

export const RuntimeControlTest: Layer.Layer<RuntimeControl> = RuntimeControl.Test

export const makeRuntimeControlPermitLayer = (
  maxConcurrency: number
): Layer.Layer<RuntimeControl> =>
  Layer.effect(
    RuntimeControl,
    makePermitRuntimeControl(maxConcurrency).pipe(
      Effect.map((service) => RuntimeControl.make(service))
    )
  )

export const withProviderPermitStream = <A, E, R>(
  runtimeControl: RuntimeControl,
  provider: string,
  stream: Stream.Stream<A, E, R>
): Stream.Stream<A, E, R> =>
  Stream.unwrapScoped(
    Effect.gen(function* () {
      type QueueItem =
        | { readonly _tag: "value"; readonly value: A }
        | { readonly _tag: "error"; readonly cause: Cause.Cause<E> }
        | { readonly _tag: "end" }

      const queue = yield* Queue.unbounded<QueueItem>()
      const enqueue = (item: QueueItem) => Queue.offer(queue, item)

      const producer = runtimeControl
        .withProviderPermit(
          provider,
          stream.pipe(
            Stream.runForEach((value) => enqueue({ _tag: "value", value }))
          )
        )
        .pipe(
          Effect.matchCauseEffect({
            onFailure: (cause) => enqueue({ _tag: "error", cause }),
            onSuccess: () => enqueue({ _tag: "end" })
          })
        )

      yield* Effect.forkScoped(producer)

      const state = {} as const

      return Stream.unfoldEffect(state, () =>
        Queue.take(queue).pipe(
          Effect.flatMap((item): Effect.Effect<Option.Option<readonly [A, typeof state]>, E> => {
            switch (item._tag) {
              case "value":
                return Effect.succeed(Option.some([item.value, state] as const))
              case "end":
                return Effect.succeed(Option.none())
              case "error":
                return Effect.failCause(item.cause)
            }
          })
        )
      )
    })
  )
