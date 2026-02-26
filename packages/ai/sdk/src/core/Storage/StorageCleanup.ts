import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schedule from "effect/Schedule"
import { ArtifactStore } from "./ArtifactStore.js"
import { AuditEventStore } from "./AuditEventStore.js"
import { ChatHistoryStore } from "./ChatHistoryStore.js"
import { StorageConfig } from "./StorageConfig.js"
import type { StorageError } from "./StorageError.js"

const logCleanupWarning = (phase: string, cause: unknown) =>
  Effect.logWarning(
    `[StorageCleanup] ${phase} cleanup failed: ${String(cause)}`
  )

const runCleanup = Effect.gen(function*() {
  const { settings } = yield* StorageConfig
  const tasks: Array<Effect.Effect<void, StorageError>> = []

  const chat = yield* ChatHistoryStore
  if (settings.enabled.chatHistory && chat.cleanup) {
    tasks.push(chat.cleanup())
  }

  const artifacts = yield* ArtifactStore
  if (settings.enabled.artifacts && artifacts.cleanup) {
    tasks.push(artifacts.cleanup())
  }

  const audit = yield* AuditEventStore
  if (settings.enabled.auditLog && audit.cleanup) {
    tasks.push(audit.cleanup())
  }

  if (tasks.length === 0) return
  yield* Effect.forEach(tasks, (task) => task, { discard: true, concurrency: 1 })
})

export class StorageCleanup extends Context.Tag("@effect/claude-agent-sdk/StorageCleanup")<
  StorageCleanup,
  {
    readonly run: Effect.Effect<void, StorageError>
  }
>() {
  static readonly layer = Layer.scoped(
    StorageCleanup,
    Effect.gen(function*() {
      const config = yield* StorageConfig
      const chat = yield* ChatHistoryStore
      const artifacts = yield* ArtifactStore
      const audit = yield* AuditEventStore
      const { settings } = config

      const run = runCleanup.pipe(
        Effect.provideService(StorageConfig, config),
        Effect.provideService(ChatHistoryStore, chat),
        Effect.provideService(ArtifactStore, artifacts),
        Effect.provideService(AuditEventStore, audit)
      )

      if (settings.cleanup.enabled) {
        if (settings.cleanup.runOnStart) {
          yield* run.pipe(
            Effect.catchAll((cause) => logCleanupWarning("startup", cause).pipe(Effect.asVoid))
          )
        }

        yield* Effect.forkScoped(
          run.pipe(
            Effect.catchAll((cause) => logCleanupWarning("scheduled", cause).pipe(Effect.asVoid)),
            Effect.repeat(Schedule.spaced(settings.cleanup.interval))
          )
        )
      }

      return StorageCleanup.of({
        run
      })
    })
  )
}
