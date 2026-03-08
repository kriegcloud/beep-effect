import { NodeServices } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import type { AgentId, ExternalServiceId, IntegrationId } from "@template/domain/ids"
import type { IntegrationPort } from "@template/domain/ports"
import { DateTime, Effect, Layer, Schedule } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { GovernancePortMemory } from "../src/GovernancePortMemory.js"
import { IntegrationPortSqlite } from "../src/IntegrationPortSqlite.js"
import {
  ExternalServiceClientRegistry,
  type ExternalServiceClientRegistryService
} from "../src/integrations/ExternalServiceClientRegistry.js"
import { StdioIntegrationClient } from "../src/integrations/StdioIntegrationClient.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { IntegrationPortTag } from "../src/PortTags.js"
import { RuntimeSupervisor } from "../src/runtime/RuntimeSupervisor.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"
import { ToolExecution } from "../src/tools/ToolExecution.js"
import { layer as CliRuntimeLocalLayer } from "../src/tools/cli/CliRuntimeLocal.js"
import { layer as CommandBackendLocalLayer } from "../src/tools/command/CommandBackendLocal.js"
import { CommandRuntime } from "../src/tools/command/CommandRuntime.js"
import { CommandHooksDefaultLayer } from "../src/tools/command/hooks/CommandHooksDefault.js"
import { FilePathPolicy } from "../src/tools/file/FilePathPolicy.js"
import { FileReadTracker } from "../src/tools/file/FileReadTracker.js"
import { FileRuntime } from "../src/tools/file/FileRuntime.js"
import { FileHooksDefaultLayer } from "../src/tools/file/hooks/FileHooksDefault.js"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })

const integrationEndpointCommand =
  "/usr/bin/env bun -e 'console.log(JSON.stringify({capabilities:[{name:\"diagnostics.search\",kind:\"tool\",description:\"Search diagnostics\"}]})); setInterval(() => {}, 1000)'"

const AGENT_ID = "agent:default" as AgentId
const SERVICE_ID = "svc:diagnostics" as ExternalServiceId
const INTEGRATION_ID = `integration:auto:${SERVICE_ID}` as IntegrationId

const makeAgentConfigLayer = () =>
  AgentConfig.layerFromParsed(withTestPromptsConfig({
    providers: { anthropic: { apiKeyEnv: "TEST_KEY" } },
    agents: {
      default: {
        persona: { name: "Kernel E2E" },
        promptBindings: {
          turn: {
            systemPromptRef: "core.turn.system.default",
            replayContinuationRef: "core.turn.replay.continuation"
          },
          memory: {
            triggerEnvelopeRef: "memory.trigger.envelope",
            tierInstructionRefs: {
              WorkingMemory: "memory.tier.working",
              EpisodicMemory: "memory.tier.episodic",
              SemanticMemory: "memory.tier.semantic",
              ProceduralMemory: "memory.tier.procedural"
            }
          },
          compaction: {
            summaryBlockRef: "compaction.block.summary",
            artifactRefsBlockRef: "compaction.block.artifacts",
            toolRefsBlockRef: "compaction.block.tools",
            keptContextBlockRef: "compaction.block.kept"
          }
        },
        model: { provider: "anthropic", modelId: "test-model" },
        generation: { temperature: 0.2, maxOutputTokens: 1024 }
      }
    },
    server: { port: 3000 },
    integrations: [{
      serviceId: SERVICE_ID,
      name: "Diagnostics Adapter",
      endpoint: integrationEndpointCommand,
      transport: "stdio" as const,
      identifier: "diagnostics-adapter"
    }]
  }))

const makeKernelLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  const integrationPortSqliteLayer = IntegrationPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const integrationPortTagLayer = Layer.effect(
    IntegrationPortTag,
    Effect.gen(function*() {
      return (yield* IntegrationPortSqlite) as IntegrationPort
    })
  ).pipe(Layer.provide(integrationPortSqliteLayer))

  const runtimeSupervisorLayer = RuntimeSupervisor.layer
  const sandboxRuntimeLayer = SandboxRuntime.layer
  const governancePortMemoryLayer = GovernancePortMemory.layer.pipe(
    Layer.provide(sandboxRuntimeLayer)
  )
  const agentConfigLayer = makeAgentConfigLayer()

  const cliRuntimeLayer = CliRuntimeLocalLayer.pipe(
    Layer.provide(NodeServices.layer)
  )
  const commandBackendLayer = CommandBackendLocalLayer.pipe(
    Layer.provide(cliRuntimeLayer)
  )
  const commandRuntimeLayer = CommandRuntime.layer.pipe(
    Layer.provide(Layer.mergeAll(
      CommandHooksDefaultLayer,
      commandBackendLayer,
      sandboxRuntimeLayer,
      NodeServices.layer
    ))
  )

  const filePathPolicyLayer = FilePathPolicy.layer.pipe(
    Layer.provide(NodeServices.layer)
  )
  const fileRuntimeLayer = FileRuntime.layer.pipe(
    Layer.provide(Layer.mergeAll(
      FileHooksDefaultLayer,
      FileReadTracker.layer,
      filePathPolicyLayer,
      sandboxRuntimeLayer,
      NodeServices.layer
    ))
  )

  const toolExecutionLayer = ToolExecution.layer.pipe(
    Layer.provide(Layer.mergeAll(
      commandRuntimeLayer,
      fileRuntimeLayer,
      filePathPolicyLayer,
      Layer.succeed(SqlClient.SqlClient, {} as SqlClient.SqlClient),
      NodeServices.layer
    ))
  )

  const stdioIntegrationClientLayer = StdioIntegrationClient.layer.pipe(
    Layer.provide(NodeServices.layer)
  )

  const integrationRegistryLayer = ExternalServiceClientRegistry.layer.pipe(
    Layer.provide(Layer.mergeAll(
      integrationPortTagLayer,
      runtimeSupervisorLayer,
      agentConfigLayer,
      stdioIntegrationClientLayer
    ))
  )

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    integrationPortSqliteLayer,
    integrationPortTagLayer,
    runtimeSupervisorLayer,
    sandboxRuntimeLayer,
    governancePortMemoryLayer,
    commandRuntimeLayer,
    filePathPolicyLayer,
    fileRuntimeLayer,
    toolExecutionLayer,
    integrationRegistryLayer
  )
}

const waitForConnectedStatus = (
  registry: ExternalServiceClientRegistryService
) =>
  registry.getStatus(INTEGRATION_ID).pipe(
    Effect.flatMap((status) =>
      status !== null && status.status === "Connected"
        ? Effect.succeed(status)
        : Effect.fail("integration-not-connected-yet")
    ),
    Effect.retry(
      Schedule.spaced("100 millis").pipe(
        Schedule.compose(Schedule.recurs(50))
      )
    )
  )

describe("KernelSlice e2e use case", () => {
  it("boots integration runtime, enforces sandboxed file tooling, and exposes supervisor ownership", async () => {
    const dbPath = testDatabasePath("kernel-slice-e2e")
    const fixtureDir = join(process.cwd(), "tmp", `kernel-slice-${crypto.randomUUID()}`)
    mkdirSync(fixtureDir, { recursive: true })
    writeFileSync(
      join(fixtureDir, "diagnostics-kernel.txt"),
      "kernel slice diagnostics fixture\n",
      "utf8"
    )

    const relativeFixtureDir = fixtureDir.startsWith(`${process.cwd()}/`)
      ? fixtureDir.slice(process.cwd().length + 1)
      : fixtureDir

    const program = Effect.gen(function*() {
      const runtimeSupervisor = yield* RuntimeSupervisor
      const registry = yield* ExternalServiceClientRegistry
      const governance = yield* GovernancePortMemory
      const toolExecution = yield* ToolExecution

      const connectedStatus = yield* waitForConnectedStatus(registry)
      expect(connectedStatus.serviceId).toBe(SERVICE_ID)
      expect(connectedStatus.capabilities.length).toBeGreaterThan(0)
      expect(connectedStatus.capabilities[0]?.name).toBe("diagnostics.search")
      expect(DateTime.toEpochMillis(connectedStatus.updatedAt)).toBeGreaterThan(0)

      const unsandboxedFailure = yield* toolExecution.findFiles({
        pattern: "diagnostics-kernel",
        path: relativeFixtureDir,
        context: {
          source: "tool",
          agentId: AGENT_ID
        }
      }).pipe(Effect.flip)
      expect(unsandboxedFailure.errorCode).toBe("SandboxViolation")

      const sandboxedResult = yield* governance.enforceSandbox(
        AGENT_ID,
        toolExecution.findFiles({
          pattern: "diagnostics-kernel",
          path: relativeFixtureDir,
          context: {
            source: "tool",
            agentId: AGENT_ID
          }
        })
      )
      expect(sandboxedResult.matches.some((entry) => entry.includes("diagnostics-kernel.txt"))).toBe(true)

      const runtimeSnapshot = yield* runtimeSupervisor.snapshot()
      expect(
        runtimeSnapshot.workers.some((worker) => worker.key === `runtime.integration.${SERVICE_ID}`)
      ).toBe(true)

      yield* registry.disconnect(SERVICE_ID)
      const disconnectedStatus = yield* registry.getStatus(INTEGRATION_ID)
      expect(disconnectedStatus?.status).toBe("Disconnected")

      const runtimeSnapshotAfterDisconnect = yield* runtimeSupervisor.snapshot()
      expect(
        runtimeSnapshotAfterDisconnect.workers.some(
          (worker) => worker.key === `runtime.integration.${SERVICE_ID}`
        )
      ).toBe(false)
    }).pipe(
      Effect.provide(makeKernelLayer(dbPath)),
      Effect.scoped,
      Effect.ensuring(
        Effect.all([
          cleanupDatabase(dbPath),
          Effect.sync(() => {
            rmSync(fixtureDir, { recursive: true, force: true })
          })
        ], { discard: true })
      )
    )
    await Effect.runPromise(program)
  }, 15_000)
})
