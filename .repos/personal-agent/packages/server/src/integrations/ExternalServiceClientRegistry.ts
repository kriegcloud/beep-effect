import { IntegrationIdentityConflict, IntegrationNotFound } from "@template/domain/errors"
import type { AgentId, ExternalServiceId, IntegrationId } from "@template/domain/ids"
import type {
  ExternalServiceRecord,
  IntegrationRecord,
  ServiceCapability
} from "@template/domain/integration"
import type { Instant } from "@template/domain/ports"
import type { IntegrationStatus } from "@template/domain/status"
import { DateTime, Deferred, Duration, Effect, Layer, Ref, Schedule, Semaphore, ServiceMap } from "effect"
import { AgentConfig, AgentProfileNotFound } from "../ai/AgentConfig.js"
import { IntegrationPortTag } from "../PortTags.js"
import { RuntimeSupervisor } from "../runtime/RuntimeSupervisor.js"
import type { CommandExecutionError } from "../tools/command/CommandErrors.js"
import {
  ArgvIntegrationClient,
  ArgvIntegrationInvocationError,
  type ArgvInvocationResult
} from "./ArgvIntegrationClient.js"
import {
  type IntegrationRuntimeHealth,
  StdioIntegrationClient,
  type StdioProcessHandle
} from "./StdioIntegrationClient.js"

const RECONNECT_DELAY = Duration.seconds(5)
const HEALTH_CHECK_INTERVAL = Duration.seconds(5)

const makeAgentServiceKey = (agentId: AgentId, serviceId: ExternalServiceId): string =>
  `${agentId}::${serviceId}`

const workerKeyForIntegration = (integrationId: IntegrationId): string =>
  `runtime.integration.${integrationId}`

export interface RuntimeIntegrationStatus {
  readonly integrationId: IntegrationId
  readonly agentId: AgentId
  readonly serviceId: ExternalServiceId
  readonly status: IntegrationStatus
  readonly health: IntegrationRuntimeHealth
  readonly capabilities: ReadonlyArray<ServiceCapability>
  readonly pid: number | null
  readonly lastError: string | null
  readonly updatedAt: Instant
}

export interface RuntimeIntegrationSummary {
  readonly total: number
  readonly connected: number
  readonly initializing: number
  readonly error: number
  readonly disconnected: number
  readonly degraded: number
}

export interface RuntimeIntegrationSnapshot {
  readonly summary: RuntimeIntegrationSummary
  readonly integrations: ReadonlyArray<RuntimeIntegrationStatus>
}

export interface ExternalServiceConnectRequest {
  readonly integrationId: IntegrationId
  readonly agentId: AgentId
  readonly service: ExternalServiceRecord
}

export interface ExternalServiceInvokeRequest {
  readonly integrationId: IntegrationId
  readonly agentId: AgentId
  readonly args?: ReadonlyArray<string>
  readonly timeoutMs?: number
  readonly outputLimitBytes?: number
}

interface RegistryEntry {
  readonly integrationId: IntegrationId
  readonly agentId: AgentId
  readonly service: ExternalServiceRecord
  readonly status: IntegrationStatus
  readonly health: IntegrationRuntimeHealth
  readonly capabilities: ReadonlyArray<ServiceCapability>
  readonly createdAt: Instant
  readonly updatedAt: Instant
  readonly lastError: string | null
  readonly process: StdioProcessHandle | null
}

export interface ExternalServiceClientRegistryService {
  readonly connect: (
    request: ExternalServiceConnectRequest
  ) => Effect.Effect<void, IntegrationIdentityConflict | AgentProfileNotFound>
  readonly disconnect: (integrationId: IntegrationId) => Effect.Effect<void>
  readonly invoke: (
    request: ExternalServiceInvokeRequest
  ) => Effect.Effect<
    ArgvInvocationResult,
    IntegrationNotFound
    | IntegrationIdentityConflict
    | ArgvIntegrationInvocationError
    | CommandExecutionError
  >
  readonly getStatus: (integrationId: IntegrationId) => Effect.Effect<RuntimeIntegrationStatus | null>
  readonly snapshot: () => Effect.Effect<RuntimeIntegrationSnapshot>
}

const toRuntimeStatus = (entry: RegistryEntry): RuntimeIntegrationStatus => ({
  integrationId: entry.integrationId,
  agentId: entry.agentId,
  serviceId: entry.service.serviceId,
  status: entry.status,
  health: entry.health,
  capabilities: entry.capabilities,
  pid: entry.process === null ? null : Number(entry.process.child.pid),
  lastError: entry.lastError,
  updatedAt: entry.updatedAt
})

const summarizeIntegrations = (
  integrations: ReadonlyArray<RuntimeIntegrationStatus>
): RuntimeIntegrationSummary => ({
  total: integrations.length,
  connected: integrations.filter((item) => item.status === "Connected").length,
  initializing: integrations.filter((item) => item.status === "Initializing").length,
  error: integrations.filter((item) => item.status === "Error").length,
  disconnected: integrations.filter((item) => item.status === "Disconnected").length,
  degraded: integrations.filter((item) => item.health === "degraded").length
})

export class ExternalServiceClientRegistry extends ServiceMap.Service<ExternalServiceClientRegistryService>()(
  "server/integrations/ExternalServiceClientRegistry",
  {
    make: Effect.gen(function*() {
      const integrationPort = yield* IntegrationPortTag
      const runtimeSupervisor = yield* RuntimeSupervisor
      const stdioClient = yield* StdioIntegrationClient
      const argvClient = yield* ArgvIntegrationClient
      const agentConfig = yield* AgentConfig

      const entriesRef = yield* Ref.make(new Map<IntegrationId, RegistryEntry>())
      const agentServiceIndexRef = yield* Ref.make(new Map<string, IntegrationId>())
      const mutationLock = yield* Semaphore.make(1)

      const isKnownConfiguredAgent = (agentId: AgentId): boolean => {
        const raw = String(agentId)
        if (agentConfig.agents.has(raw)) {
          return true
        }
        return raw.startsWith("agent:")
          ? agentConfig.agents.has(raw.slice("agent:".length))
          : false
      }

      const ensureKnownConfiguredAgent = (
        agentId: AgentId
      ): Effect.Effect<void, AgentProfileNotFound> =>
        isKnownConfiguredAgent(agentId)
          ? Effect.void
          : Effect.fail(new AgentProfileNotFound({ agentId }))

      const withLock = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
        mutationLock.withPermits(1)(effect)

      const persistEntry = (entry: RegistryEntry) =>
        Effect.gen(function*() {
          const record: IntegrationRecord = {
            integrationId: entry.integrationId,
            agentId: entry.agentId,
            serviceId: entry.service.serviceId,
            status: entry.status,
            capabilities: [...entry.capabilities],
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          }

          yield* integrationPort.createService(entry.service)
          yield* integrationPort.createIntegration(record)
        })

      const setEntry = (entry: RegistryEntry) =>
        withLock(
          Effect.gen(function*() {
            const entries = yield* Ref.get(entriesRef)
            const serviceIndex = yield* Ref.get(agentServiceIndexRef)

            const nextEntries = new Map(entries)
            const previous = nextEntries.get(entry.integrationId)
            nextEntries.set(entry.integrationId, entry)

            const nextIndex = new Map(serviceIndex)
            if (previous !== undefined) {
              nextIndex.delete(makeAgentServiceKey(previous.agentId, previous.service.serviceId))
            }
            nextIndex.set(makeAgentServiceKey(entry.agentId, entry.service.serviceId), entry.integrationId)

            yield* Ref.set(entriesRef, nextEntries)
            yield* Ref.set(agentServiceIndexRef, nextIndex)
          })
        )

      const getEntry = (integrationId: IntegrationId): Effect.Effect<RegistryEntry | null> =>
        Ref.get(entriesRef).pipe(
          Effect.map((entries) => entries.get(integrationId) ?? null)
        )

      const getEntryByAgentService = (agentId: AgentId, serviceId: ExternalServiceId) =>
        withLock(
          Effect.gen(function*() {
            const index = yield* Ref.get(agentServiceIndexRef)
            const integrationId = index.get(makeAgentServiceKey(agentId, serviceId))
            if (integrationId === undefined) {
              return null as RegistryEntry | null
            }
            const entries = yield* Ref.get(entriesRef)
            return entries.get(integrationId) ?? null
          })
        )

      const updateEntry = (
        integrationId: IntegrationId,
        update: (entry: RegistryEntry) => RegistryEntry
      ) =>
        withLock(
          Effect.gen(function*() {
            const entries = yield* Ref.get(entriesRef)
            const current = entries.get(integrationId)
            if (current === undefined) {
              return null as RegistryEntry | null
            }

            const next = update(current)

            const nextEntries = new Map(entries)
            nextEntries.set(integrationId, next)
            yield* Ref.set(entriesRef, nextEntries)

            const serviceIndex = yield* Ref.get(agentServiceIndexRef)
            const nextIndex = new Map(serviceIndex)
            nextIndex.delete(makeAgentServiceKey(current.agentId, current.service.serviceId))
            nextIndex.set(makeAgentServiceKey(next.agentId, next.service.serviceId), integrationId)
            yield* Ref.set(agentServiceIndexRef, nextIndex)

            return next
          })
        )

      const clearProcessHandle = (integrationId: IntegrationId) =>
        updateEntry(integrationId, (entry) => ({
          ...entry,
          process: null
        })).pipe(Effect.asVoid)

      const transitionToError = (integrationId: IntegrationId, errorMessage: string) =>
        Effect.gen(function*() {
          const now = yield* DateTime.now
          const updated = yield* updateEntry(integrationId, (entry) => ({
            ...entry,
            status: "Error",
            health: "degraded",
            lastError: errorMessage,
            updatedAt: now,
            process: null
          }))

          if (updated !== null) {
            yield* persistEntry(updated)
          }
        })

      const transitionToConnected = (
        integrationId: IntegrationId,
        connection: {
          readonly health: IntegrationRuntimeHealth
          readonly capabilities: ReadonlyArray<ServiceCapability>
          readonly discoveryError: string | null
          readonly handle: StdioProcessHandle | null
        }
      ) =>
        Effect.gen(function*() {
          const now = yield* DateTime.now
          const updated = yield* updateEntry(integrationId, (entry) => ({
            ...entry,
            status: "Connected",
            health: connection.health,
            capabilities: connection.capabilities,
            lastError: connection.discoveryError,
            updatedAt: now,
            process: connection.handle
          }))

          if (updated !== null) {
            yield* persistEntry(updated)
          }
        })

      const transitionToInitializing = (integrationId: IntegrationId) =>
        Effect.gen(function*() {
          const now = yield* DateTime.now
          const updated = yield* updateEntry(integrationId, (entry) => ({
            ...entry,
            status: "Initializing",
            health: "healthy",
            lastError: null,
            updatedAt: now,
            process: null
          }))

          if (updated !== null) {
            yield* persistEntry(updated)
          }
        })

      const waitForExitWithHealthChecks = (handle: StdioProcessHandle): Effect.Effect<number> =>
        Effect.gen(function*() {
          const exitDeferred = yield* Deferred.make<number>()

          const publishExit = (effect: Effect.Effect<number>): Effect.Effect<void> =>
            effect.pipe(
              Effect.flatMap((exitCode) => Deferred.succeed(exitDeferred, exitCode)),
              Effect.asVoid
            )

          const observeByExitSignal = publishExit(
            stdioClient.waitForExit(handle)
          )

          const observeByHealthCheck = stdioClient.isRunning(handle).pipe(
            Effect.flatMap((running) =>
              running
                ? Effect.void
                : publishExit(stdioClient.waitForExit(handle))
            ),
            Effect.repeat(Schedule.spaced(HEALTH_CHECK_INTERVAL))
          )

          yield* Effect.raceFirst(observeByExitSignal, observeByHealthCheck)
          return yield* Deferred.await(exitDeferred)
        })

      const runWorkerAttempt = (integrationId: IntegrationId): Effect.Effect<void> =>
        Effect.gen(function*() {
          const entry = yield* getEntry(integrationId)
          if (entry === null) {
            return
          }

          if (entry.service.transport !== "stdio") {
            return
          }

          yield* transitionToInitializing(integrationId)

          const connection = yield* stdioClient.connect(entry.service)
          if (connection.handle === null) {
            yield* transitionToError(
              integrationId,
              connection.discoveryError ?? "integration connect failed"
            )
            return
          }

          yield* transitionToConnected(integrationId, connection)

          const exitCode = yield* Effect.acquireUseRelease(
            Effect.succeed(connection.handle),
            waitForExitWithHealthChecks,
            (handle) =>
              stdioClient.terminate(handle).pipe(
                Effect.andThen(clearProcessHandle(integrationId))
              )
          )

          yield* transitionToError(
            integrationId,
            `integration process exited with code ${exitCode}`
          )
        })

      const workerLoop = (integrationId: IntegrationId) =>
        runWorkerAttempt(integrationId).pipe(
          Effect.andThen(Effect.sleep(RECONNECT_DELAY)),
          Effect.forever
        )

      const connect = Effect.fn("ExternalServiceClientRegistry.connect")(function*(
        request: ExternalServiceConnectRequest
      ) {
        yield* ensureKnownConfiguredAgent(request.agentId)

        const existingForService = yield* integrationPort.getIntegrationByService(
          request.agentId,
          request.service.serviceId
        )

        if (
          existingForService !== null
          && existingForService.integrationId !== request.integrationId
        ) {
          return yield* new IntegrationIdentityConflict({
            requestedIntegrationId: request.integrationId,
            existingIntegrationId: existingForService.integrationId,
            agentId: request.agentId,
            serviceId: request.service.serviceId
          })
        }

        const existingById = yield* integrationPort.getIntegration(request.integrationId)
        if (
          existingById !== null
          && (
            existingById.agentId !== request.agentId
            || existingById.serviceId !== request.service.serviceId
          )
        ) {
          return yield* new IntegrationIdentityConflict({
            requestedIntegrationId: request.integrationId,
            existingIntegrationId: existingById.integrationId,
            agentId: request.agentId,
            serviceId: request.service.serviceId
          })
        }

        const inMemoryExistingForService = yield* getEntryByAgentService(
          request.agentId,
          request.service.serviceId
        )
        if (
          inMemoryExistingForService !== null
          && inMemoryExistingForService.integrationId !== request.integrationId
        ) {
          return yield* new IntegrationIdentityConflict({
            requestedIntegrationId: request.integrationId,
            existingIntegrationId: inMemoryExistingForService.integrationId,
            agentId: request.agentId,
            serviceId: request.service.serviceId
          })
        }

        const now = yield* DateTime.now
        const baseline = existingById ?? existingForService

        const entry: RegistryEntry = {
          integrationId: request.integrationId,
          agentId: request.agentId,
          service: request.service,
          status: "Initializing",
          health: "healthy",
          capabilities: baseline?.capabilities ?? [],
          createdAt: baseline?.createdAt ?? now,
          updatedAt: now,
          lastError: null,
          process: null
        }

        yield* setEntry(entry)
        yield* persistEntry(entry)

        yield* runtimeSupervisor.stop(workerKeyForIntegration(request.integrationId))

          switch (request.service.transport) {
            case "stdio": {
              const started = yield* runtimeSupervisor.start(
                workerKeyForIntegration(request.integrationId),
                workerLoop(request.integrationId)
              )
              if (!started) {
                yield* transitionToError(
                  request.integrationId,
                  `failed to register integration worker ${workerKeyForIntegration(request.integrationId)}`
                )
              }
              break
            }
          case "argv": {
            yield* transitionToConnected(request.integrationId, {
              capabilities: entry.capabilities,
              discoveryError: null,
              handle: null,
              health: "healthy"
            })
            break
          }
          case "http":
          case "sse": {
            yield* transitionToError(
              request.integrationId,
              `transport ${request.service.transport} is not supported by the runtime integration kernel`
            )
            break
          }
        }

        yield* Effect.log("Integration connect scheduled", {
          serviceId: request.service.serviceId,
          integrationId: request.integrationId,
          agentId: request.agentId,
          transport: request.service.transport
        })
      })

      const disconnect = Effect.fn("ExternalServiceClientRegistry.disconnect")(function*(
        integrationId: IntegrationId
      ) {
        const entry = yield* getEntry(integrationId)

        if (entry?.process !== null && entry !== null) {
          yield* stdioClient.terminate(entry.process)
        }

        yield* runtimeSupervisor.stop(workerKeyForIntegration(integrationId))

        const now = yield* DateTime.now
        if (entry !== null) {
          const disconnected: RegistryEntry = {
            ...entry,
            status: "Disconnected",
            process: null,
            updatedAt: now,
            lastError: null,
            health: entry.health === "degraded" ? "degraded" : "healthy"
          }
          yield* setEntry(disconnected)
          yield* persistEntry(disconnected)
        } else {
          const persisted = yield* integrationPort.getIntegration(integrationId)
          if (persisted !== null) {
            yield* integrationPort.createIntegration({
              ...persisted,
              status: "Disconnected",
              updatedAt: now
            })
          }
        }

        yield* Effect.log("Integration disconnected", {
          integrationId,
          serviceId: entry?.service.serviceId ?? null
        })
      })

      const hydratePersistedEntry = (
        integrationId: IntegrationId
      ): Effect.Effect<RegistryEntry | null> =>
        Effect.gen(function*() {
          const persisted = yield* integrationPort.getIntegration(integrationId)
          if (persisted === null) {
            return null
          }
          const service = yield* integrationPort.getService(persisted.serviceId)
          if (service === null) {
            return null
          }

          const entry: RegistryEntry = {
            integrationId: persisted.integrationId,
            agentId: persisted.agentId,
            service,
            status: persisted.status,
            health: persisted.status === "Error" ? "degraded" : "healthy",
            capabilities: persisted.capabilities,
            createdAt: persisted.createdAt,
            updatedAt: persisted.updatedAt,
            lastError: null,
            process: null
          }

          yield* setEntry(entry)
          return entry
        })

      const resolveEntry = (integrationId: IntegrationId): Effect.Effect<RegistryEntry | null> =>
        getEntry(integrationId).pipe(
          Effect.flatMap((entry) =>
            entry !== null
              ? Effect.succeed(entry)
              : hydratePersistedEntry(integrationId)
          )
        )

      const invoke: ExternalServiceClientRegistryService["invoke"] = (request) =>
        Effect.gen(function*() {
          const entry = yield* resolveEntry(request.integrationId)
          if (entry === null) {
            return yield* new IntegrationNotFound({
              integrationId: request.integrationId
            })
          }

          if (entry.agentId !== request.agentId) {
            return yield* new IntegrationIdentityConflict({
              requestedIntegrationId: request.integrationId,
              existingIntegrationId: entry.integrationId,
              agentId: request.agentId,
              serviceId: entry.service.serviceId
            })
          }

          if (entry.service.transport !== "argv") {
            return yield* new ArgvIntegrationInvocationError({
              reason: `integration ${entry.integrationId} transport ${entry.service.transport} does not support argv invoke`
            })
          }

          return yield* argvClient.invoke({
            agentId: request.agentId,
            service: entry.service,
            ...(request.args !== undefined ? { args: request.args } : {}),
            ...(request.timeoutMs !== undefined ? { timeoutMs: request.timeoutMs } : {}),
            ...(request.outputLimitBytes !== undefined ? { outputLimitBytes: request.outputLimitBytes } : {})
          })
        })

      const getStatus: ExternalServiceClientRegistryService["getStatus"] = (integrationId) =>
        resolveEntry(integrationId).pipe(
          Effect.map((entry) => (entry === null ? null : toRuntimeStatus(entry)))
        )

      const snapshot: ExternalServiceClientRegistryService["snapshot"] = () =>
        Effect.gen(function*() {
          const entries = yield* Ref.get(entriesRef)
          const integrations = [...entries.values()]
            .map(toRuntimeStatus)
            .sort((left, right) => {
              const serviceSort = left.serviceId.localeCompare(right.serviceId)
              if (serviceSort !== 0) {
                return serviceSort
              }
              return left.integrationId.localeCompare(right.integrationId)
            })

          return {
            integrations,
            summary: summarizeIntegrations(integrations)
          } satisfies RuntimeIntegrationSnapshot
        })

      yield* Effect.forEach(
        agentConfig.integrations,
        (configured) =>
          Effect.gen(function*() {
            const agentId = configured.agentId as AgentId
            yield* ensureKnownConfiguredAgent(agentId)

            const service = {
              serviceId: configured.serviceId as ExternalServiceId,
              name: configured.name,
              endpoint: configured.endpoint,
              transport: configured.transport,
              argv: configured.argv,
              identifier: configured.identifier ?? configured.endpoint,
              createdAt: yield* DateTime.now
            } satisfies ExternalServiceRecord

            const existing = yield* integrationPort.getIntegrationByService(
              agentId,
              service.serviceId
            )
            const integrationId = (
              existing?.integrationId
              ?? `integration:auto:${agentId}:${service.serviceId}`
            ) as IntegrationId

            yield* connect({
              integrationId,
              agentId,
              service
            })
          }),
        { concurrency: "unbounded", discard: true }
      )

      return {
        connect,
        disconnect,
        invoke,
        getStatus,
        snapshot
      } satisfies ExternalServiceClientRegistryService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
