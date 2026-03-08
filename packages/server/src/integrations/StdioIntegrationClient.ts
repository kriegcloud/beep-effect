import type { ExternalServiceRecord, ServiceCapability } from "@template/domain/integration"
import {
  ServicePromptCapability,
  ServiceResourceCapability,
  ServiceToolCapability
} from "@template/domain/integration"
import {
  Cause,
  Duration,
  Effect,
  Exit,
  Layer,
  Option,
  Schema,
  Scope,
  ServiceMap,
  Stream
} from "effect"
import * as ChildProcess from "effect/unstable/process/ChildProcess"
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import { decodeJsonStringOption } from "../json/JsonStringCodecs.js"

export type IntegrationRuntimeHealth = "healthy" | "degraded"

export interface StdioProcessHandle {
  readonly child: ChildProcessSpawner.ChildProcessHandle
  readonly scope: Scope.Closeable
}

export interface StdioConnectResult {
  readonly handle: StdioProcessHandle | null
  readonly capabilities: ReadonlyArray<ServiceCapability>
  readonly health: IntegrationRuntimeHealth
  readonly discoveryError: string | null
}

export interface StdioIntegrationClientService {
  readonly connect: (service: ExternalServiceRecord) => Effect.Effect<StdioConnectResult>
  readonly isRunning: (handle: StdioProcessHandle) => Effect.Effect<boolean>
  readonly waitForExit: (handle: StdioProcessHandle) => Effect.Effect<number>
  readonly terminate: (handle: StdioProcessHandle) => Effect.Effect<void>
}

const CAPABILITY_DISCOVERY_TIMEOUT_MS = 1_500

const CapabilityDiscoveryEntry = Schema.Struct({
  name: Schema.String,
  _tag: Schema.optional(Schema.String),
  kind: Schema.optional(Schema.String),
  type: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  uri: Schema.optional(Schema.String)
})
type CapabilityDiscoveryEntry = typeof CapabilityDiscoveryEntry.Type

const CapabilityDiscoveryPayload = Schema.Struct({
  capabilities: Schema.Array(CapabilityDiscoveryEntry)
})
const decodeCapabilityDiscoveryPayload = decodeJsonStringOption(CapabilityDiscoveryPayload)

const normalizeCapabilityType = (value: unknown): "tool" | "resource" | "prompt" | null => {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.toLowerCase()
  if (normalized.includes("tool")) {
    return "tool"
  }
  if (normalized.includes("resource")) {
    return "resource"
  }
  if (normalized.includes("prompt")) {
    return "prompt"
  }
  return null
}

const decodeCapability = (entry: CapabilityDiscoveryEntry): ServiceCapability | null => {
  const capabilityType = normalizeCapabilityType(entry._tag ?? entry.kind ?? entry.type)

  switch (capabilityType) {
    case "tool":
      return new ServiceToolCapability({
        name: entry.name,
        description: entry.description
      })
    case "resource":
      return new ServiceResourceCapability({
        name: entry.name,
        description: entry.description,
        uri: entry.uri
      })
    case "prompt":
      return new ServicePromptCapability({
        name: entry.name,
        description: entry.description
      })
    default:
      return null
  }
}

const decodeCapabilitiesFromLine = (line: string): {
  readonly capabilities: ReadonlyArray<ServiceCapability>
  readonly health: IntegrationRuntimeHealth
  readonly discoveryError: string | null
} => {
  const decodedPayload = decodeCapabilityDiscoveryPayload(line)
  if (Option.isNone(decodedPayload)) {
    return {
      capabilities: [],
      health: "degraded",
      discoveryError: "invalid capability payload JSON"
    }
  }

  const decodedCapabilities = decodedPayload.value.capabilities.map(decodeCapability)
  if (decodedCapabilities.some((capability) => capability === null)) {
    return {
      capabilities: [],
      health: "degraded",
      discoveryError: "capability payload contains invalid capability entries"
    }
  }

  return {
    capabilities: decodedCapabilities as ReadonlyArray<ServiceCapability>,
    health: "healthy",
    discoveryError: null
  }
}

const closeScopeQuietly = (scope: Scope.Closeable): Effect.Effect<void> =>
  Scope.close(scope, Exit.void)

const makeService = Effect.gen(function*() {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner

  const connect = Effect.fn("StdioIntegrationClient.connect")(function*(
    service: ExternalServiceRecord
  ) {
    if (service.endpoint.trim().length === 0) {
      return {
        handle: null,
        capabilities: [] as ReadonlyArray<ServiceCapability>,
        health: "degraded" as const,
        discoveryError: `integration ${service.serviceId} has an empty endpoint command`
      } satisfies StdioConnectResult
    }

    const scope = yield* Scope.make()
    const command = ChildProcess.make(service.endpoint, {
      shell: true,
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
      extendEnv: true
    })

    const spawnExit = yield* Scope.provide(scope)(spawner.spawn(command)).pipe(Effect.exit)
    if (Exit.isFailure(spawnExit)) {
      yield* closeScopeQuietly(scope)
      return {
        handle: null,
        capabilities: [] as ReadonlyArray<ServiceCapability>,
        health: "degraded" as const,
        discoveryError: `failed to spawn integration process: ${Cause.pretty(spawnExit.cause)}`
      } satisfies StdioConnectResult
    }

    const child = spawnExit.value

    const firstLineWindow = yield* child.stdout.pipe(
      Stream.decodeText(),
      Stream.splitLines,
      Stream.map((line) => line.trim()),
      Stream.filter((line) => line.length > 0),
      Stream.take(1),
      Stream.runHead,
      Effect.timeoutOption(Duration.millis(CAPABILITY_DISCOVERY_TIMEOUT_MS)),
      Effect.catch(() => Effect.succeed(Option.none()))
    )

    const discoveryResult = Option.isNone(firstLineWindow)
      ? {
          capabilities: [] as ReadonlyArray<ServiceCapability>,
          health: "degraded" as const,
          discoveryError: "capability discovery timed out"
        }
      : Option.isNone(firstLineWindow.value)
        ? {
            capabilities: [] as ReadonlyArray<ServiceCapability>,
            health: "degraded" as const,
            discoveryError: "capability discovery produced no stdout line"
          }
        : decodeCapabilitiesFromLine(firstLineWindow.value.value)

    const running = yield* child.isRunning.pipe(
      Effect.catch(() => Effect.succeed(false))
    )

    if (!running) {
      const exitCode = yield* child.exitCode.pipe(
        Effect.option,
        Effect.map(Option.match({
          onNone: () => "unknown",
          onSome: (code) => String(Number(code))
        }))
      )

      yield* closeScopeQuietly(scope)
      return {
        handle: null,
        capabilities: [],
        health: "degraded",
        discoveryError: `integration process exited before connect completed (code ${exitCode})`
      } satisfies StdioConnectResult
    }

    return {
      handle: { child, scope },
      capabilities: discoveryResult.capabilities,
      health: discoveryResult.health,
      discoveryError: discoveryResult.discoveryError
    } satisfies StdioConnectResult
  })

  const isRunning = Effect.fn("StdioIntegrationClient.isRunning")(function*(
    handle: StdioProcessHandle
  ) {
    return yield* handle.child.isRunning.pipe(
      Effect.catch(() => Effect.succeed(false))
    )
  })

  const waitForExit = Effect.fn("StdioIntegrationClient.waitForExit")(function*(
    handle: StdioProcessHandle
  ) {
    return yield* handle.child.exitCode.pipe(
      Effect.map((code) => Number(code)),
      Effect.catch(() => Effect.succeed(-1))
    )
  })

  const terminate = Effect.fn("StdioIntegrationClient.terminate")(function*(
    handle: StdioProcessHandle
  ) {
    yield* handle.child.kill().pipe(
      Effect.catch(() => Effect.void)
    )
    yield* closeScopeQuietly(handle.scope)
  })

  return {
    connect,
    isRunning,
    waitForExit,
    terminate
  } satisfies StdioIntegrationClientService
})

export class StdioIntegrationClient extends ServiceMap.Service<StdioIntegrationClientService>()(
  "server/integrations/StdioIntegrationClient",
  {
    make: makeService
  }
) {
  static layer = Layer.effect(this, this.make)
}
