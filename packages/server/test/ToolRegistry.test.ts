import { describe, expect, it } from "@effect/vitest"
import { NodeServices } from "@effect/platform-node"
import type { AgentId, ArtifactId, ConversationId, SessionId, TurnId } from "@template/domain/ids"
import type {
  AgentState,
  ArtifactStorePort,
  CheckpointPort,
  GovernancePort,
  Instant,
  MemoryPort,
  SessionArtifactPort,
  SessionMetricsPort
} from "@template/domain/ports"
import { DateTime, Effect, Layer, Schema, Stream } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { AgentStatePortSqlite } from "../src/AgentStatePortSqlite.js"
import { ToolRegistry } from "../src/ai/ToolRegistry.js"
import { GovernancePortSqlite } from "../src/GovernancePortSqlite.js"
import { MemoryPortSqlite } from "../src/MemoryPortSqlite.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { CheckpointPortSqlite } from "../src/CheckpointPortSqlite.js"
import {
  ArtifactStorePortTag,
  CheckpointPortTag,
  GovernancePortTag,
  MemoryPortTag,
  SessionArtifactPortTag,
  SessionMetricsPortTag
} from "../src/PortTags.js"
import { layer as CliRuntimeLocalLayer } from "../src/tools/cli/CliRuntimeLocal.js"
import { layer as CommandBackendLocalLayer } from "../src/tools/command/CommandBackendLocal.js"
import { CommandRuntime } from "../src/tools/command/CommandRuntime.js"
import type { CommandInvocationContext } from "../src/tools/command/CommandTypes.js"
import { type CommandHook } from "../src/tools/command/CommandHooks.js"
import {
  CommandHooksDefaultLayer,
  withAdditionalCommandHooks
} from "../src/tools/command/hooks/CommandHooksDefault.js"
import type { FileHook } from "../src/tools/file/FileHooks.js"
import { FilePathPolicy } from "../src/tools/file/FilePathPolicy.js"
import { FileReadTracker } from "../src/tools/file/FileReadTracker.js"
import { FileRuntime } from "../src/tools/file/FileRuntime.js"
import {
  FileHooksDefaultLayer,
  withAdditionalFileHooks
} from "../src/tools/file/hooks/FileHooksDefault.js"
import { ToolExecution } from "../src/tools/ToolExecution.js"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

const SESSION_ID = "session:tool-registry" as SessionId
const CONVERSATION_ID = "conversation:tool-registry" as ConversationId
const TURN_ID = "turn:tool-registry" as TurnId
const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))
const NOW = instant("2026-02-27T12:00:00.000Z")

describe("ToolRegistry", () => {
  it("allow path records compliant tool invocation", async () => {
    const dbPath = testDatabasePath("tool-registry-allow")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:allow" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      const governance = yield* GovernancePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Standard",
        budgetResetAt: NOW
      }))

      const output = yield* invokeTool(agentId, "echo_text", { text: "hello" })
      expect(output).toContain("\"hello\"")

      const records = yield* governance.listToolInvocationsBySession(SESSION_ID, {})
      expect(records.totalCount).toBe(1)
      expect(records.items[0].toolName).toBe("echo_text")
      expect(records.items[0].decision).toBe("Allow")
      expect(records.items[0].complianceStatus).toBe("Compliant")
      expect(records.items[0].conversationId).toBe(CONVERSATION_ID)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("deny path records non-compliant invocation when policy denies", async () => {
    const dbPath = testDatabasePath("tool-registry-deny")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:missing" as AgentId

    const program = Effect.gen(function*() {
      const governance = yield* GovernancePortSqlite

      const failure = (yield* invokeTool(agentId, "echo_text", { text: "blocked" }).pipe(
        Effect.flip
      )) as { readonly errorCode: string }

      expect(failure.errorCode).toBe("PolicyDenied")

      const records = yield* governance.listToolInvocationsBySession(SESSION_ID, {})
      expect(records.totalCount).toBe(1)
      expect(records.items[0].decision).toBe("Deny")
      expect(records.items[0].complianceStatus).toBe("NonCompliant")
      expect(records.items[0].reason).toContain("tool_policy_denied")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("quota exceeded path records non-compliant invocation", async () => {
    const dbPath = testDatabasePath("tool-registry-quota")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:quota" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      const governance = yield* GovernancePortSqlite
      const sql = yield* SqlClient.SqlClient

      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Standard",
        budgetResetAt: NOW
      }))

      const windowStart = DateTime.formatIso(DateTime.removeTime(NOW))
      yield* sql`
        INSERT INTO tool_quota_counters (
          agent_id,
          tool_name,
          window_start,
          used_count
        ) VALUES (
          ${agentId},
          ${"echo_text"},
          ${windowStart},
          ${500}
        )
      `.unprepared

      const failure = (yield* invokeTool(agentId, "echo_text", { text: "over-limit" }).pipe(
        Effect.flip
      )) as { readonly errorCode: string }
      expect(failure.errorCode).toBe("ToolQuotaExceeded")

      const records = yield* governance.listToolInvocationsBySession(SESSION_ID, {})
      expect(records.totalCount).toBe(1)
      expect(records.items[0].decision).toBe("Deny")
      expect(records.items[0].complianceStatus).toBe("NonCompliant")
      expect(records.items[0].reason).toContain("tool_quota_exceeded")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("governance system error fails closed and records non-compliant invocation", async () => {
    const dbPath = testDatabasePath("tool-registry-governance-error")
    const layer = makeToolRegistryLayer(dbPath, {
      evaluatePolicy: () => Effect.die("policy backend unavailable")
    })
    const agentId = "agent:error" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      const governance = yield* GovernancePortSqlite

      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      const failure = (yield* invokeTool(agentId, "echo_text", { text: "test" }).pipe(
        Effect.flip
      )) as { readonly errorCode: string }
      expect(failure.errorCode).toBe("GovernancePolicyError")

      const records = yield* governance.listToolInvocationsBySession(SESSION_ID, {})
      expect(records.totalCount).toBe(1)
      expect(records.items[0].decision).toBe("Deny")
      expect(records.items[0].complianceStatus).toBe("NonCompliant")
      expect(records.items[0].reason).toBe("governance_system_error:evaluate_policy")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("store_memory happy path stores and returns memoryId", async () => {
    const dbPath = testDatabasePath("tool-registry-store-memory")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:store-mem" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Standard",
        budgetResetAt: NOW
      }))

      const output = yield* invokeTool(agentId, "store_memory", {
        content: "test fact",
        tags: ["tag1"]
      })
      expect(output).toContain("memoryId")
      expect(output).toContain("true")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("retrieve_memories returns stored memories", async () => {
    const dbPath = testDatabasePath("tool-registry-retrieve-memories")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:retrieve-mem" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Standard",
        budgetResetAt: NOW
      }))

      yield* invokeTool(agentId, "store_memory", {
        content: "remembered fact for retrieval"
      })

      const output = yield* invokeTool(agentId, "retrieve_memories", {
        query: "remembered fact",
        limit: 5
      })
      expect(output).toContain("remembered fact")
      expect(output).toContain("memoryId")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("forget_memories removes stored memories", async () => {
    const dbPath = testDatabasePath("tool-registry-forget-memories")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:forget-mem" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Standard",
        budgetResetAt: NOW
      }))

      const storeOutput = yield* invokeTool(agentId, "store_memory", {
        content: "memory to forget"
      })
      // Extract memoryId from the JSON output string
      const memoryIdMatch = storeOutput.match(/"memoryId"\s*:\s*"([^"]+)"/)
      expect(memoryIdMatch).not.toBeNull()
      const memoryId = memoryIdMatch![1]

      const forgetOutput = yield* invokeTool(agentId, "forget_memories", {
        memoryIds: [memoryId]
      })
      expect(forgetOutput).toContain("\"forgotten\"")
      expect(forgetOutput).toContain("1")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("forget_memories with empty IDs returns InvalidMemoryIds error", async () => {
    const dbPath = testDatabasePath("tool-registry-forget-empty")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:forget-empty" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Standard",
        budgetResetAt: NOW
      }))

      const failure = (yield* invokeTool(agentId, "forget_memories", {
        memoryIds: ["", "  "]
      }).pipe(
        Effect.flip
      )) as { readonly errorCode: string }
      expect(failure.errorCode).toBe("InvalidMemoryIds")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("shell_execute uses Effect process runtime and returns command output", async () => {
    const dbPath = testDatabasePath("tool-registry-shell-execute")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:shell-execute" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      const output = yield* invokeTool(agentId, "shell_execute", {
        command: "echo effect-shell"
      })
      expect(output).toContain("effect-shell")
      expect(output).toContain("\"exitCode\":0")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("shell_execute denies commands blocked by command policy hook", async () => {
    const dbPath = testDatabasePath("tool-registry-shell-policy-deny")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:shell-policy-deny" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      const failure = (yield* invokeTool(agentId, "shell_execute", {
        command: "sudo ls"
      }).pipe(
        Effect.flip
      )) as { readonly errorCode: string; readonly message: string }

      expect(failure.errorCode).toBe("CommandHookRejected")
      expect(failure.message).toContain("blocked by command policy")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("shell_execute forwards invocation context to command hooks", async () => {
    const capturedContexts: Array<CommandInvocationContext> = []
    const dbPath = testDatabasePath("tool-registry-shell-context")
    const agentId = "agent:shell-context" as AgentId
    const layer = makeToolRegistryLayer(
      dbPath,
      {},
      {
        commandHooks: [
          {
            id: "capture-context",
            beforeExecute: ({ context }) =>
              Effect.sync(() => {
                capturedContexts.push(context)
              })
          }
        ]
      }
    )

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      const output = yield* invokeTool(agentId, "shell_execute", {
        command: "echo context-forwarded"
      })
      expect(output).toContain("context-forwarded")

      expect(capturedContexts).toHaveLength(1)
      expect(capturedContexts[0].source).toBe("tool")
      expect(capturedContexts[0].agentId).toBe(agentId)
      expect(capturedContexts[0].sessionId).toBe(SESSION_ID)
      expect(capturedContexts[0].turnId).toBe(TURN_ID)
      expect(capturedContexts[0].channelId).toBe("channel:test")
      expect(capturedContexts[0].toolName).toBe("shell_execute")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_write uses Effect filesystem runtime and writes workspace files", async () => {
    const dbPath = testDatabasePath("tool-registry-file-write")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-write" as AgentId
    const relativePath = `tmp/tool-registry-${crypto.randomUUID()}.txt`
    const absolutePath = join(process.cwd(), relativePath)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      const output = yield* invokeTool(agentId, "file_write", {
        path: relativePath,
        content: "effect native write"
      })
      expect(output).toContain("bytesWritten")
      expect(output).toContain(relativePath)
      expect(readFileSync(absolutePath, "utf8")).toBe("effect native write")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absolutePath, { force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_read returns file content from workspace", async () => {
    const dbPath = testDatabasePath("tool-registry-file-read")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-read" as AgentId
    const relativePath = `tmp/tool-registry-read-${crypto.randomUUID()}.txt`
    const absolutePath = join(process.cwd(), relativePath)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      writeFileSync(absolutePath, "read me please", "utf8")

      const output = yield* invokeTool(agentId, "file_read", {
        path: relativePath
      })
      expect(output).toContain("\"ok\":true")
      expect(output).toContain("read me please")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absolutePath, { force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_read supports offset/limit pagination hints", async () => {
    const dbPath = testDatabasePath("tool-registry-file-read-pagination")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-read-pagination" as AgentId
    const relativePath = `tmp/tool-registry-read-page-${crypto.randomUUID()}.txt`
    const absolutePath = join(process.cwd(), relativePath)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      writeFileSync(absolutePath, "line1\nline2\nline3\nline4\n", "utf8")

      const output = yield* invokeTool(agentId, "file_read", {
        path: relativePath,
        offset: 2,
        limit: 2
      })
      expect(output).toContain("line2")
      expect(output).toContain("line3")
      expect(output).toContain("Use offset=4 to continue")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absolutePath, { force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_read invalid offset fails when recovery mode is disabled", async () => {
    const dbPath = testDatabasePath("tool-registry-file-read-invalid-offset")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-read-invalid-offset" as AgentId
    const relativePath = `tmp/tool-registry-read-invalid-${crypto.randomUUID()}.txt`
    const absolutePath = join(process.cwd(), relativePath)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      writeFileSync(absolutePath, "line1\nline2\n", "utf8")

      const failure = yield* invokeTool(agentId, "file_read", {
        path: relativePath,
        offset: 0
      }).pipe(Effect.flip)

      expect((failure as { readonly errorCode: string }).errorCode).toBe("InvalidReadRequest")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absolutePath, { force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_read invalid offset returns tool error payload when recovery mode is enabled", async () => {
    const dbPath = testDatabasePath("tool-registry-file-read-recover-offset")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-read-recover-offset" as AgentId
    const relativePath = `tmp/tool-registry-read-recover-${crypto.randomUUID()}.txt`
    const absolutePath = join(process.cwd(), relativePath)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      writeFileSync(absolutePath, "line1\nline2\n", "utf8")

      const output = yield* invokeTool(
        agentId,
        "file_read",
        {
          path: relativePath,
          offset: 0
        },
        { recoverToolErrors: true }
      )

      expect(output).toContain("\"ok\":false")
      expect(output).toContain("\"errorCode\":\"InvalidReadRequest\"")
      expect(output).toContain("offset must be a positive integer")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absolutePath, { force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_ls lists directory entries via CLI runtime", async () => {
    const dbPath = testDatabasePath("tool-registry-file-ls")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-ls" as AgentId
    const relativeDir = `tmp/tool-registry-ls-${crypto.randomUUID()}`
    const absoluteDir = join(process.cwd(), relativeDir)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      mkdirSync(absoluteDir, { recursive: true })
      writeFileSync(join(absoluteDir, "alpha.txt"), "alpha", "utf8")
      writeFileSync(join(absoluteDir, "beta.log"), "beta", "utf8")

      const output = yield* invokeTool(agentId, "file_ls", {
        path: relativeDir
      })
      expect(output).toContain("\"ok\":true")
      expect(output).toContain("alpha.txt")
      expect(output).toContain("beta.log")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absoluteDir, { recursive: true, force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_ls supports ignore glob patterns", async () => {
    const dbPath = testDatabasePath("tool-registry-file-ls-ignore")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-ls-ignore" as AgentId
    const relativeDir = `tmp/tool-registry-ls-ignore-${crypto.randomUUID()}`
    const absoluteDir = join(process.cwd(), relativeDir)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      mkdirSync(absoluteDir, { recursive: true })
      writeFileSync(join(absoluteDir, "keep.txt"), "keep", "utf8")
      writeFileSync(join(absoluteDir, "skip.log"), "skip", "utf8")

      const output = yield* invokeTool(agentId, "file_ls", {
        path: relativeDir,
        ignore: ["*.log"]
      })
      expect(output).toContain("\"ok\":true")
      expect(output).toContain("keep.txt")
      expect(output).not.toContain("skip.log")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absoluteDir, { recursive: true, force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_ls rejects non-positive limits", async () => {
    const dbPath = testDatabasePath("tool-registry-file-ls-invalid-limit")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-ls-invalid-limit" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      const failure = (yield* invokeTool(agentId, "file_ls", {
        limit: 0
      }).pipe(
        Effect.flip
      )) as { readonly errorCode: string }
      expect(failure.errorCode).toBe("InvalidFileRequest")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_find locates matching files by pattern", async () => {
    const dbPath = testDatabasePath("tool-registry-file-find")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-find" as AgentId
    const relativeDir = `tmp/tool-registry-find-${crypto.randomUUID()}`
    const absoluteDir = join(process.cwd(), relativeDir)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      mkdirSync(join(absoluteDir, "nested"), { recursive: true })
      writeFileSync(join(absoluteDir, "nested", "find-me.txt"), "found", "utf8")
      writeFileSync(join(absoluteDir, "nested", "ignore.txt"), "ignore", "utf8")

      const output = yield* invokeTool(agentId, "file_find", {
        path: relativeDir,
        pattern: "find-me"
      })
      expect(output).toContain("\"ok\":true")
      expect(output).toContain("find-me.txt")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absoluteDir, { recursive: true, force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_grep returns matching lines with line numbers", async () => {
    const dbPath = testDatabasePath("tool-registry-file-grep")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-grep" as AgentId
    const relativeDir = `tmp/tool-registry-grep-${crypto.randomUUID()}`
    const absoluteDir = join(process.cwd(), relativeDir)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      mkdirSync(absoluteDir, { recursive: true })
      writeFileSync(
        join(absoluteDir, "search-target.txt"),
        "line one\nneedle-token appears here\nline three\n",
        "utf8"
      )

      const output = yield* invokeTool(agentId, "file_grep", {
        path: relativeDir,
        pattern: "needle-token"
      })
      expect(output).toContain("\"ok\":true")
      expect(output).toContain("needle-token appears here")
      expect(output).toContain("\"line\":2")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absoluteDir, { recursive: true, force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_grep supports include filters and literal text mode", async () => {
    const dbPath = testDatabasePath("tool-registry-file-grep-include-literal")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-grep-include-literal" as AgentId
    const relativeDir = `tmp/tool-registry-grep-include-${crypto.randomUUID()}`
    const absoluteDir = join(process.cwd(), relativeDir)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      mkdirSync(absoluteDir, { recursive: true })
      writeFileSync(join(absoluteDir, "match.txt"), "literal a+b(c)\n", "utf8")
      writeFileSync(join(absoluteDir, "other.ts"), "literal a+b(c)\n", "utf8")

      const output = yield* invokeTool(agentId, "file_grep", {
        path: relativeDir,
        pattern: "a+b(c)",
        include: "*.txt",
        literal_text: true
      })

      expect(output).toContain("\"ok\":true")
      expect(output).toContain("match.txt")
      expect(output).not.toContain("other.ts")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absoluteDir, { recursive: true, force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_grep applies result limits with truncation metadata", async () => {
    const dbPath = testDatabasePath("tool-registry-file-grep-truncation")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-grep-truncation" as AgentId
    const relativeDir = `tmp/tool-registry-grep-truncation-${crypto.randomUUID()}`
    const absoluteDir = join(process.cwd(), relativeDir)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      mkdirSync(absoluteDir, { recursive: true })
      writeFileSync(
        join(absoluteDir, "many.txt"),
        "needle line 1\nneedle line 2\nneedle line 3\n",
        "utf8"
      )

      const output = yield* invokeTool(agentId, "file_grep", {
        path: relativeDir,
        pattern: "needle",
        limit: 1
      })

      expect(output).toContain("\"ok\":true")
      expect(output).toContain("\"truncated\":true")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absoluteDir, { recursive: true, force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_edit applies a unique replacement and returns a diff", async () => {
    const dbPath = testDatabasePath("tool-registry-file-edit")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-edit" as AgentId
    const relativePath = `tmp/tool-registry-edit-${crypto.randomUUID()}.txt`
    const absolutePath = join(process.cwd(), relativePath)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      writeFileSync(absolutePath, "hello world\n", "utf8")

      const output = yield* invokeTool(agentId, "file_edit", {
        path: relativePath,
        old_string: "hello world",
        new_string: "hello effect"
      })
      expect(output).toContain("\"ok\":true")
      expect(output).toContain("\"diff\"")
      expect(readFileSync(absolutePath, "utf8")).toContain("hello effect")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absolutePath, { force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_edit fails when replacement target is ambiguous", async () => {
    const dbPath = testDatabasePath("tool-registry-file-edit-ambiguous")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-edit-ambiguous" as AgentId
    const relativePath = `tmp/tool-registry-edit-ambiguous-${crypto.randomUUID()}.txt`
    const absolutePath = join(process.cwd(), relativePath)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      writeFileSync(absolutePath, "token\nmiddle\ntoken\n", "utf8")

      const failure = (yield* invokeTool(agentId, "file_edit", {
        path: relativePath,
        old_string: "token",
        new_string: "patched"
      }).pipe(
        Effect.flip
      )) as { readonly errorCode: string }
      expect(failure.errorCode).toBe("FileEditAmbiguous")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absolutePath, { force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file_write rejects stale writes after a tracked read and external mutation", async () => {
    const dbPath = testDatabasePath("tool-registry-file-stale")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:file-stale" as AgentId
    const relativePath = `tmp/tool-registry-stale-${crypto.randomUUID()}.txt`
    const absolutePath = join(process.cwd(), relativePath)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      writeFileSync(absolutePath, "initial", "utf8")

      yield* invokeTool(agentId, "file_read", { path: relativePath })
      writeFileSync(absolutePath, "externally-mutated", "utf8")

      const failure = (yield* invokeTool(agentId, "file_write", {
        path: relativePath,
        content: "runtime-write"
      }).pipe(
        Effect.flip
      )) as { readonly errorCode: string }
      expect(failure.errorCode).toBe("FileStaleRead")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absolutePath, { force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("file tools forward invocation context to file hooks", async () => {
    const capturedContexts: Array<CommandInvocationContext> = []
    const dbPath = testDatabasePath("tool-registry-file-context")
    const agentId = "agent:file-context" as AgentId
    const relativePath = `tmp/tool-registry-context-${crypto.randomUUID()}.txt`
    const absolutePath = join(process.cwd(), relativePath)
    const layer = makeToolRegistryLayer(
      dbPath,
      {},
      {
        fileHooks: [
          {
            id: "capture-file-context",
            beforeRead: ({ context }) =>
              Effect.sync(() => {
                capturedContexts.push(context)
              }),
            beforeWrite: ({ context }) =>
              Effect.sync(() => {
                capturedContexts.push(context)
              }),
            beforeEdit: ({ context }) =>
              Effect.sync(() => {
                capturedContexts.push(context)
              })
          }
        ]
      }
    )

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      yield* invokeTool(agentId, "file_write", {
        path: relativePath,
        content: "hello"
      })
      yield* invokeTool(agentId, "file_read", {
        path: relativePath
      })
      yield* invokeTool(agentId, "file_edit", {
        path: relativePath,
        old_string: "hello",
        new_string: "world"
      })

      expect(capturedContexts).toHaveLength(3)
      expect(capturedContexts[0]?.toolName).toBe("file_write")
      expect(capturedContexts[1]?.toolName).toBe("file_read")
      expect(capturedContexts[2]?.toolName).toBe("file_edit")
      for (const captured of capturedContexts) {
        expect(captured.source).toBe("tool")
        expect(captured.agentId).toBe(agentId)
        expect(captured.sessionId).toBe(SESSION_ID)
        expect(captured.turnId).toBe(TURN_ID)
        expect(captured.channelId).toBe("channel:test")
      }
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absolutePath, { force: true })))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("send_notification persists delivered notifications", async () => {
    const dbPath = testDatabasePath("tool-registry-send-notification")
    const layer = makeToolRegistryLayer(dbPath)
    const agentId = "agent:notify" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      const sql = yield* SqlClient.SqlClient

      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      const output = yield* invokeTool(agentId, "send_notification", {
        recipient: "ops",
        message: "run completed"
      })
      expect(output).toContain("notificationId")
      expect(output).toContain("\"delivered\":true")

      const rows = yield* sql`
        SELECT recipient, message, delivery_status
        FROM notifications
      `.unprepared
      expect(rows.length).toBe(1)
      const row = rows[0] as {
        readonly recipient: string
        readonly message: string
        readonly delivery_status: string
      }
      expect(row.recipient).toBe("ops")
      expect(row.message).toBe("run completed")
      expect(row.delivery_status).toBe("Delivered")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })
})

const invokeTool = (
  agentId: AgentId,
  toolName:
    | "echo_text"
    | "math_calculate"
    | "time_now"
    | "store_memory"
    | "retrieve_memories"
    | "forget_memories"
    | "file_read"
    | "file_ls"
    | "file_find"
    | "file_grep"
    | "shell_execute"
    | "file_write"
    | "file_edit"
    | "send_notification",
  params: Record<string, unknown>,
  options?: {
    readonly recoverToolErrors?: boolean
  }
) =>
  Effect.gen(function*() {
    const registry = yield* ToolRegistry
    const bundle = yield* registry.makeToolkit({
      agentId,
      sessionId: SESSION_ID,
      conversationId: CONVERSATION_ID,
      turnId: TURN_ID,
      now: NOW,
      channelId: "channel:test",
      ...(options?.recoverToolErrors !== undefined
        ? { recoverToolErrors: options.recoverToolErrors }
        : {})
    })
    const toolkit = yield* bundle.toolkit.asEffect().pipe(
      Effect.provide(bundle.handlerLayer)
    )
    const stream = yield* toolkit.handle(toolName as any, params as any).pipe(
      Effect.mapError(toToolFailure)
    )
    const chunks = yield* Stream.runCollect(stream).pipe(
      Effect.mapError(toToolFailure)
    )
    return encodeJson(chunks)
  })

const encodeJsonUnknown = Schema.encodeSync(Schema.UnknownFromJsonString)

const encodeJson = (value: unknown): string => encodeJsonUnknown(value)

const mockAgentConfigLayer = AgentConfig.layerFromParsed(withTestPromptsConfig({
  providers: { anthropic: { apiKeyEnv: "TEST_KEY" } },
  agents: {
    default: {
      persona: { name: "Test"  },
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
      generation: { temperature: 0.7, maxOutputTokens: 1024 }
    }
  },
  server: { port: 3000 }
}))

const makeToolRegistryLayer = (
  dbPath: string,
  overrides: Partial<GovernancePort> = {},
  options: {
    readonly commandHooks?: ReadonlyArray<CommandHook>
    readonly fileHooks?: ReadonlyArray<FileHook>
  } = {}
) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)
  const sandboxRuntimeLayer = SandboxRuntime.layer

  const governanceSqliteLayer = GovernancePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.provide(sandboxRuntimeLayer)
  )
  const governanceTagLayer = Layer.effect(
    GovernancePortTag,
    Effect.gen(function*() {
      const governance = yield* GovernancePortSqlite
      return {
        ...governance,
        ...overrides
      } as GovernancePort
    })
  ).pipe(Layer.provide(governanceSqliteLayer))

  const memoryPortSqliteLayer = MemoryPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const memoryPortTagLayer = Layer.effect(
    MemoryPortTag,
    Effect.gen(function*() {
      return (yield* MemoryPortSqlite) as MemoryPort
    })
  ).pipe(Layer.provide(memoryPortSqliteLayer))

  const checkpointPortSqliteLayer = CheckpointPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const checkpointPortTagLayer = Layer.effect(
    CheckpointPortTag,
    Effect.gen(function*() {
      return (yield* CheckpointPortSqlite) as CheckpointPort
    })
  ).pipe(Layer.provide(checkpointPortSqliteLayer))

  const artifactStoreLayer = Layer.succeed(ArtifactStorePortTag, {
    putJson: () =>
      Effect.succeed({
        artifactId: "artifact:test" as ArtifactId,
        sha256: "test",
        mediaType: "application/json",
        bytes: 0,
        previewText: null
      }),
    putBytes: () =>
      Effect.succeed({
        artifactId: "artifact:test" as ArtifactId,
        sha256: "test",
        mediaType: "application/octet-stream",
        bytes: 0,
        previewText: null
      }),
    getBytes: () => Effect.succeed(new Uint8Array())
  } as ArtifactStorePort)

  const sessionArtifactLayer = Layer.succeed(SessionArtifactPortTag, {
    link: () => Effect.void,
    listBySession: () => Effect.succeed([])
  } as SessionArtifactPort)

  const sessionMetricsLayer = Layer.succeed(SessionMetricsPortTag, {
    increment: () => Effect.void,
    get: () => Effect.succeed(null),
    shouldTriggerCompaction: () => Effect.succeed(false)
  } as SessionMetricsPort)

  const commandHooksLayer = options.commandHooks === undefined
    ? CommandHooksDefaultLayer
    : withAdditionalCommandHooks(options.commandHooks)

  const cliRuntimeLayer = CliRuntimeLocalLayer.pipe(
    Layer.provide(NodeServices.layer)
  )

  const commandBackendLayer = CommandBackendLocalLayer.pipe(
    Layer.provide(cliRuntimeLayer)
  )

  const commandRuntimeLayer = CommandRuntime.layer.pipe(
    Layer.provide(commandHooksLayer),
    Layer.provide(commandBackendLayer),
    Layer.provide(sandboxRuntimeLayer),
    Layer.provide(NodeServices.layer)
  )

  const fileHooksLayer = options.fileHooks === undefined
    ? FileHooksDefaultLayer
    : withAdditionalFileHooks(options.fileHooks)

  const filePathPolicyLayer = FilePathPolicy.layer.pipe(
    Layer.provide(NodeServices.layer)
  )

  const fileReadTrackerLayer = FileReadTracker.layer

  const fileRuntimeLayer = FileRuntime.layer.pipe(
    Layer.provide(fileHooksLayer),
    Layer.provide(fileReadTrackerLayer),
    Layer.provide(filePathPolicyLayer),
    Layer.provide(sandboxRuntimeLayer),
    Layer.provide(NodeServices.layer)
  )

  const toolExecutionLayer = ToolExecution.layer.pipe(
    Layer.provide(fileRuntimeLayer),
    Layer.provide(filePathPolicyLayer),
    Layer.provide(cliRuntimeLayer),
    Layer.provide(commandRuntimeLayer),
    Layer.provide(sqlInfrastructureLayer),
    Layer.provide(NodeServices.layer)
  )

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    AgentStatePortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer)),
    governanceSqliteLayer,
    governanceTagLayer,
    memoryPortSqliteLayer,
    memoryPortTagLayer,
    checkpointPortSqliteLayer,
    checkpointPortTagLayer,
    toolExecutionLayer,
    ToolRegistry.layer.pipe(
      Layer.provide(toolExecutionLayer),
      Layer.provide(governanceTagLayer),
      Layer.provide(memoryPortTagLayer),
      Layer.provide(mockAgentConfigLayer),
      Layer.provide(checkpointPortTagLayer),
      Layer.provide(artifactStoreLayer),
      Layer.provide(sessionArtifactLayer),
      Layer.provide(sessionMetricsLayer)
    )
  )
}

const makeAgentState = (overrides: Partial<AgentState>): AgentState => ({
  agentId: "agent:default" as AgentId,
  permissionMode: "Standard",
  tokenBudget: 1_000,
  maxToolIterations: 10,
  quotaPeriod: "Daily",
  tokensConsumed: 0,
  budgetResetAt: null,
  ...overrides
})

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })

const toToolFailure = (error: unknown): { readonly errorCode: string; readonly message: string } => ({
  errorCode: (
      typeof error === "object"
      && error !== null
      && "errorCode" in error
      && typeof (error as { readonly errorCode?: unknown }).errorCode === "string"
    )
    ? (error as { readonly errorCode: string }).errorCode
    : "ToolInvocationError",
  message: (
      typeof error === "object"
      && error !== null
      && "message" in error
      && typeof (error as { readonly message?: unknown }).message === "string"
    )
    ? (error as { readonly message: string }).message
    : error instanceof Error
    ? error.message
    : String(error)
})
