import type { Instant } from "@template/domain/ports"
import {
  DateTime,
  Effect,
  FiberMap,
  Layer,
  Ref,
  ServiceMap,
  Semaphore
} from "effect"

export interface RuntimeWorkerSnapshot {
  readonly key: string
  readonly status: "running" | "suspended" | "done"
  readonly startedAt: Instant
  readonly required: boolean
}

export interface RuntimeSupervisorSnapshot {
  readonly activeWorkerCount: number
  readonly supervisedFiberCount: number
  readonly requiredKeys: ReadonlyArray<string>
  readonly missingRequiredKeys: ReadonlyArray<string>
  readonly workers: ReadonlyArray<RuntimeWorkerSnapshot>
}

interface WorkerMetadata {
  readonly startedAt: Instant
  readonly required: boolean
}

export interface RuntimeWorkerStartOptions {
  readonly required?: boolean
}

export interface RuntimeSupervisorService {
  readonly start: <A, E, R>(
    key: string,
    effect: Effect.Effect<A, E, R>,
    options?: RuntimeWorkerStartOptions
  ) => Effect.Effect<boolean, never, R>
  readonly stop: (key: string) => Effect.Effect<boolean>
  readonly snapshot: () => Effect.Effect<RuntimeSupervisorSnapshot>
}

export class RuntimeSupervisor extends ServiceMap.Service<RuntimeSupervisor>()(
  "server/runtime/RuntimeSupervisor",
  {
    make: Effect.gen(function*() {
      const fiberMap = yield* FiberMap.make<string, unknown, unknown>()
      const metadataRef = yield* Ref.make(new Map<string, WorkerMetadata>())
      const requiredKeysRef = yield* Ref.make(new Set<string>())
      const mutationLock = yield* Semaphore.make(1)

      const start: RuntimeSupervisorService["start"] = (key, effect, options) =>
        mutationLock.withPermits(1)(
          Effect.gen(function*() {
            const required = options?.required === true
            if (required) {
              yield* Ref.update(requiredKeysRef, (keys) => {
                const next = new Set(keys)
                next.add(key)
                return next
              })
            }

            const exists = yield* FiberMap.has(fiberMap, key)
            if (exists) {
              return false
            }

            const startedAt = yield* DateTime.now
            yield* Ref.update(metadataRef, (map) => {
              const next = new Map(map)
              next.set(key, { startedAt, required })
              return next
            })

            const managedEffect = effect.pipe(
              Effect.ensuring(
                Ref.update(metadataRef, (map) => {
                  const next = new Map(map)
                  next.delete(key)
                  return next
                })
              )
            )

            yield* FiberMap.run(fiberMap, key, managedEffect)
            return true
          })
        )

      const stop: RuntimeSupervisorService["stop"] = (key) =>
        mutationLock.withPermits(1)(
          Effect.gen(function*() {
            const exists = yield* FiberMap.has(fiberMap, key)
            yield* FiberMap.remove(fiberMap, key)
            yield* Ref.update(metadataRef, (map) => {
              const next = new Map(map)
              next.delete(key)
              return next
            })
            yield* Ref.update(requiredKeysRef, (keys) => {
              const next = new Set(keys)
              next.delete(key)
              return next
            })
            return exists
          })
        )

      const snapshot: RuntimeSupervisorService["snapshot"] = () =>
        Effect.gen(function*() {
          const metadata = yield* Ref.get(metadataRef)
          const requiredKeys = [...(yield* Ref.get(requiredKeysRef))].sort((left, right) =>
            left.localeCompare(right)
          )
          const keys = [...metadata.keys()].sort((left, right) => left.localeCompare(right))
          const activeWorkerCount = yield* FiberMap.size(fiberMap)

          const workers = keys.flatMap((key) => {
            const info = metadata.get(key)
            if (info === undefined) {
              return [] as ReadonlyArray<RuntimeWorkerSnapshot>
            }

            const fiber = FiberMap.getUnsafe(fiberMap, key)
            if (fiber === undefined) {
              return [] as ReadonlyArray<RuntimeWorkerSnapshot>
            }

            const status: RuntimeWorkerSnapshot["status"] =
              fiber.pollUnsafe() === undefined ? "running" : "done"

            return [{
              key,
              status,
              startedAt: info.startedAt,
              required: info.required
            } satisfies RuntimeWorkerSnapshot]
          })

          const missingRequiredKeys = requiredKeys.filter((key) => {
            const fiber = FiberMap.getUnsafe(fiberMap, key)
            if (fiber === undefined) {
              return true
            }
            return fiber.pollUnsafe() !== undefined
          })

          return {
            activeWorkerCount,
            supervisedFiberCount: activeWorkerCount,
            requiredKeys,
            missingRequiredKeys,
            workers
          } satisfies RuntimeSupervisorSnapshot
        })

      return {
        start,
        stop,
        snapshot
      } satisfies RuntimeSupervisorService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
