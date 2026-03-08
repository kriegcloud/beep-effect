import { describe, expect, it } from "@effect/vitest"
import type { AgentId, ConversationId, SessionId, TurnId } from "@template/domain/ids"
import type { ExecutePostCommitPayload, PostCommitResult } from "@template/domain/ports"
import { Effect, Layer } from "effect"
import { ClusterWorkflowEngine, SingleRunner } from "effect/unstable/cluster"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { PostCommitExecutor } from "../src/turn/PostCommitExecutor.js"
import {
  PostCommitWorkflow,
  layer as PostCommitWorkflowLayer,
  postCommitBackoffSeconds,
  runPostCommitWithRetry
} from "../src/turn/PostCommitWorkflow.js"

const payload: ExecutePostCommitPayload = {
  turnId: "turn:test" as TurnId,
  agentId: "agent:test" as AgentId,
  sessionId: "session:test" as SessionId,
  conversationId: "conversation:test" as ConversationId
}

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })

describe("PostCommitWorkflow", () => {
  it.effect("uses turnId-only idempotency during workflow dispatch", () => {
    const dbPath = testDatabasePath("post-commit-workflow-idempotency")

    return Effect.gen(function*() {
      const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
      const migrationLayer = DomainMigrator.layer.pipe(
        Layer.provide(sqliteLayer),
        Layer.orDie
      )
      const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)
      const clusterLayer = SingleRunner.layer().pipe(
        Layer.provide(sqlInfrastructureLayer),
        Layer.orDie
      )
      const workflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
        Layer.provide(clusterLayer)
      )
      const postCommitWorkflowLayer = PostCommitWorkflowLayer.pipe(
        Layer.provide(workflowEngineLayer),
        Layer.provide(Layer.succeed(PostCommitExecutor, {
          execute: () =>
            Effect.succeed({
              subroutines: [],
              projectionSuccess: true,
              projectionError: null
            })
        } as any))
      )
      const appLayer = Layer.mergeAll(
        sqlInfrastructureLayer,
        clusterLayer,
        workflowEngineLayer,
        postCommitWorkflowLayer
      )

      const first = yield* PostCommitWorkflow.execute(payload, { discard: true }).pipe(
        Effect.provide(appLayer)
      )
      const second = yield* PostCommitWorkflow.execute({
        ...payload,
        sessionId: "session:other" as SessionId,
        conversationId: "conversation:other" as ConversationId
      }, { discard: true }).pipe(
        Effect.provide(appLayer)
      )

      expect(first).toBe(second)
    })
      .pipe(Effect.ensuring(cleanupDatabase(dbPath)))
  })

  it("backoff schedule is exponential (5, 10, 20, 40...)", () => {
    expect(postCommitBackoffSeconds(1)).toBe(5)
    expect(postCommitBackoffSeconds(2)).toBe(10)
    expect(postCommitBackoffSeconds(3)).toBe(20)
    expect(postCommitBackoffSeconds(4)).toBe(40)
  })

  it.effect("returns Succeeded on first successful execution", () =>
    Effect.gen(function*() {
      let executeCalls = 0
      const sleeps: number[] = []

      const result = yield* runPostCommitWithRetry({
        payload,
        executor: {
          execute: () =>
            Effect.sync(() => {
              executeCalls += 1
              return {
                subroutines: [],
                projectionSuccess: true,
                projectionError: null
              } satisfies PostCommitResult
            })
        },
        sleepForRetry: (attempt) =>
          Effect.sync(() => {
            sleeps.push(attempt)
          })
      })

      expect(result.status).toBe("Succeeded")
      expect(result.attempts).toBe(1)
      expect(executeCalls).toBe(1)
      expect(sleeps).toEqual([])
    })
  )

  it.effect("retries on failures and eventually succeeds", () =>
    Effect.gen(function*() {
      let executeCalls = 0
      const sleeps: number[] = []

      const outcomes: ReadonlyArray<PostCommitResult> = [
        {
          subroutines: [{ subroutineId: "sub:a", success: false, errorTag: "subroutine_failed" }],
          projectionSuccess: true,
          projectionError: null
        },
        {
          subroutines: [],
          projectionSuccess: false,
          projectionError: "projection failed"
        },
        {
          subroutines: [],
          projectionSuccess: true,
          projectionError: null
        }
      ]

      const result = yield* runPostCommitWithRetry({
        payload,
        executor: {
          execute: () =>
            Effect.sync(() => {
              const index = Math.min(executeCalls, outcomes.length - 1)
              executeCalls += 1
              return outcomes[index]!
            })
        },
        sleepForRetry: (attempt) =>
          Effect.sync(() => {
            sleeps.push(attempt)
          })
      })

      expect(result.status).toBe("Succeeded")
      expect(result.attempts).toBe(3)
      expect(executeCalls).toBe(3)
      expect(sleeps).toEqual([1, 2])
    })
  )

  it.effect("returns FailedPermanent once max attempts are exhausted", () =>
    Effect.gen(function*() {
      let executeCalls = 0
      const sleeps: number[] = []

      const result = yield* runPostCommitWithRetry({
        payload,
        maxAttempts: 3,
        executor: {
          execute: () =>
            Effect.sync(() => {
              executeCalls += 1
              return {
                subroutines: [],
                projectionSuccess: false,
                projectionError: "projection failed repeatedly"
              } satisfies PostCommitResult
            })
        },
        sleepForRetry: (attempt) =>
          Effect.sync(() => {
            sleeps.push(attempt)
          })
      })

      expect(result.status).toBe("FailedPermanent")
      expect(result.attempts).toBe(3)
      expect(executeCalls).toBe(3)
      expect(sleeps).toEqual([1, 2])
      expect(result.failureSummary).toContain("projection:")
    })
  )
})
