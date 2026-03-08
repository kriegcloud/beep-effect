import { DateTime, Effect, Layer, Option, ServiceMap } from "effect"
import { ExternalServiceClientRegistry } from "../integrations/ExternalServiceClientRegistry.js"
import { SubroutineControlPlane } from "../memory/SubroutineControlPlane.js"
import { SchedulerTickService } from "../scheduler/SchedulerTickService.js"
import { RuntimeSupervisor } from "./RuntimeSupervisor.js"

export type RuntimeReadinessState = "ready" | "degraded"

export type RuntimeKernelDegradedReason =
  | "required_workers_missing"
  | "scheduler_tick_error"
  | "integration_error"
  | "integration_degraded"
  | "subroutine_worker_error"

export interface RuntimeKernelReadinessPayload {
  readonly status: "ok" | "degraded"
  readonly service: "personal-agent"
  readonly readiness: {
    readonly state: RuntimeReadinessState
    readonly degradedReasons: ReadonlyArray<RuntimeKernelDegradedReason>
  }
  readonly runtime: {
    readonly supervisor: {
      readonly activeWorkerCount: number
      readonly supervisedFiberCount: number
      readonly requiredKeys: ReadonlyArray<string>
      readonly missingRequiredKeys: ReadonlyArray<string>
      readonly workers: ReadonlyArray<{
        readonly key: string
        readonly status: "running" | "suspended" | "done"
        readonly required: boolean
        readonly startedAt: string
      }>
    } | null
    readonly loops: ReadonlyArray<{
      readonly key: string
      readonly status: "running" | "suspended" | "done"
      readonly required: boolean
    }>
    readonly scheduler: {
      readonly lastTick: {
        readonly tickedAt: string
        readonly claimed: number
        readonly dispatched: number
        readonly accepted: number
        readonly outcome: "ok" | "error"
        readonly errorMessage: string | null
      } | null
    }
    readonly subroutines: {
      readonly queueDepth: number
      readonly inFlightCount: number
      readonly dedupeEntries: number
      readonly lastWorkerError: string | null
    }
  }
  readonly integrations: {
    readonly summary: {
      readonly total: number
      readonly connected: number
      readonly initializing: number
      readonly error: number
      readonly disconnected: number
      readonly degraded: number
    }
    readonly integrations: ReadonlyArray<{
      readonly integrationId: string
      readonly serviceId: string
      readonly status: string
      readonly health: string
      readonly pid: number | null
      readonly lastError: string | null
      readonly updatedAt: string
    }>
  }
}

export interface RuntimeKernelReadinessSnapshot {
  readonly readinessState: RuntimeReadinessState
  readonly payload: RuntimeKernelReadinessPayload
}

export interface RuntimeKernelReadinessService {
  readonly snapshot: () => Effect.Effect<RuntimeKernelReadinessSnapshot>
}

export class RuntimeKernelReadiness extends ServiceMap.Service<RuntimeKernelReadinessService>()(
  "server/runtime/RuntimeKernelReadiness",
  {
    make: Effect.gen(function*() {
      const snapshot: RuntimeKernelReadinessService["snapshot"] = () =>
        Effect.gen(function*() {
          const runtimeSupervisorOption = yield* Effect.serviceOption(RuntimeSupervisor)
          const schedulerTickServiceOption = yield* Effect.serviceOption(SchedulerTickService)
          const integrationRegistryOption = yield* Effect.serviceOption(ExternalServiceClientRegistry)
          const subroutineControlPlaneOption = yield* Effect.serviceOption(SubroutineControlPlane)

          const supervisorSnapshot = yield* Option.match(runtimeSupervisorOption, {
            onNone: () => Effect.succeed(null),
            onSome: (runtimeSupervisor) => runtimeSupervisor.snapshot()
          })

          const lastSchedulerTick = yield* Option.match(schedulerTickServiceOption, {
            onNone: () => Effect.succeed(null),
            onSome: (tickService) => tickService.getLastTickResult()
          })

          const integrationSnapshot = yield* Option.match(integrationRegistryOption, {
            onNone: () =>
              Effect.succeed({
                summary: {
                  total: 0,
                  connected: 0,
                  initializing: 0,
                  error: 0,
                  disconnected: 0,
                  degraded: 0
                },
                integrations: [] as const
              }),
            onSome: (registry) =>
              registry.snapshot().pipe(
                Effect.map((snapshot) => ({
                  summary: snapshot.summary,
                  integrations: snapshot.integrations.map((integration) => ({
                    integrationId: integration.integrationId,
                    serviceId: integration.serviceId,
                    status: integration.status,
                    health: integration.health,
                    pid: integration.pid,
                    lastError: integration.lastError,
                    updatedAt: DateTime.formatIso(integration.updatedAt)
                  }))
                }))
              )
          })

          const subroutineSnapshot = yield* Option.match(subroutineControlPlaneOption, {
            onNone: () =>
              Effect.succeed({
                queueDepth: 0,
                inFlightCount: 0,
                dedupeEntries: 0,
                lastWorkerError: null as string | null
              }),
            onSome: (controlPlane) => controlPlane.snapshot()
          })

          const degradedReasons = new Set<RuntimeKernelDegradedReason>()
          if ((supervisorSnapshot?.missingRequiredKeys.length ?? 0) > 0) {
            degradedReasons.add("required_workers_missing")
          }
          if (lastSchedulerTick?.outcome === "error") {
            degradedReasons.add("scheduler_tick_error")
          }
          if (integrationSnapshot.summary.error > 0) {
            degradedReasons.add("integration_error")
          }
          if (integrationSnapshot.summary.degraded > 0) {
            degradedReasons.add("integration_degraded")
          }
          if (subroutineSnapshot.lastWorkerError !== null) {
            degradedReasons.add("subroutine_worker_error")
          }

          const normalizedDegradedReasons = [...degradedReasons].sort((left, right) =>
            left.localeCompare(right)
          )
          const readinessState =
            normalizedDegradedReasons.length === 0
              ? "ready" as const
              : "degraded" as const

          return {
            readinessState,
            payload: {
              status: readinessState === "ready" ? "ok" : "degraded",
              service: "personal-agent",
              readiness: {
                state: readinessState,
                degradedReasons: normalizedDegradedReasons
              },
              runtime: {
                supervisor: supervisorSnapshot === null
                  ? null
                  : {
                      activeWorkerCount: supervisorSnapshot.activeWorkerCount,
                      supervisedFiberCount: supervisorSnapshot.supervisedFiberCount,
                      requiredKeys: supervisorSnapshot.requiredKeys,
                      missingRequiredKeys: supervisorSnapshot.missingRequiredKeys,
                      workers: supervisorSnapshot.workers.map((worker) => ({
                        key: worker.key,
                        status: worker.status,
                        required: worker.required,
                        startedAt: DateTime.formatIso(worker.startedAt)
                      }))
                    },
                loops: supervisorSnapshot === null
                  ? []
                  : supervisorSnapshot.workers.map((worker) => ({
                      key: worker.key,
                      status: worker.status,
                      required: worker.required
                    })),
                scheduler: {
                  lastTick: lastSchedulerTick === null
                    ? null
                    : {
                        tickedAt: DateTime.formatIso(lastSchedulerTick.tickedAt),
                        claimed: lastSchedulerTick.claimed,
                        dispatched: lastSchedulerTick.dispatched,
                        accepted: lastSchedulerTick.accepted,
                        outcome: lastSchedulerTick.outcome,
                        errorMessage: lastSchedulerTick.errorMessage
                      }
                },
                subroutines: {
                  queueDepth: subroutineSnapshot.queueDepth,
                  inFlightCount: subroutineSnapshot.inFlightCount,
                  dedupeEntries: subroutineSnapshot.dedupeEntries,
                  lastWorkerError: subroutineSnapshot.lastWorkerError
                }
              },
              integrations: integrationSnapshot
            }
          } as const
        })

      return { snapshot } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
