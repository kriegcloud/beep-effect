import type { ArtifactId, SessionId, ToolInvocationId, TurnId } from "@template/domain/ids"
import type {
  ArtifactRef,
  SessionArtifactPort,
  SessionArtifactRecord
} from "@template/domain/ports"
import type { ArtifactPurpose } from "@template/domain/status"
import { Effect, Layer, Option, Schema, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { SessionFileStore } from "./storage/SessionFileStore.js"

import { sqlInstant } from "./persistence/SqlCodecs.js"

const ListBySessionRequest = Schema.Struct({
  sessionId: Schema.String
})

const ListBySessionAndPurposeRequest = Schema.Struct({
  sessionId: Schema.String,
  purpose: Schema.String
})

const SessionArtifactRowSchema = Schema.Struct({
  session_artifact_id: Schema.String,
  session_id: Schema.String,
  artifact_id: Schema.String,
  purpose: Schema.String,
  turn_id: Schema.Union([Schema.String, Schema.Null]),
  tool_invocation_id: Schema.Union([Schema.String, Schema.Null]),
  run_id: Schema.Union([Schema.String, Schema.Null]),
  created_at: Schema.String,
  sha256: Schema.String,
  media_type: Schema.String,
  bytes: Schema.Number,
  preview_text: Schema.Union([Schema.String, Schema.Null])
})
type SessionArtifactRow = typeof SessionArtifactRowSchema.Type

const makeIdempotencyKey = (params: {
  readonly sessionId: SessionId
  readonly artifactId: ArtifactId
  readonly purpose: ArtifactPurpose
  readonly turnId: TurnId | null
  readonly toolInvocationId: ToolInvocationId | null
  readonly runId: string | null
}): string =>
  [
    params.sessionId,
    params.artifactId,
    params.purpose,
    params.turnId ?? "",
    params.toolInvocationId ?? "",
    params.runId ?? ""
  ].join(":")

const toArtifactRef = (row: SessionArtifactRow): ArtifactRef => ({
  artifactId: row.artifact_id as ArtifactId,
  sha256: row.sha256,
  mediaType: row.media_type,
  bytes: row.bytes,
  previewText: row.preview_text
})

const toSessionArtifactRecord = (row: SessionArtifactRow): SessionArtifactRecord => ({
  sessionArtifactId: row.session_artifact_id,
  sessionId: row.session_id as SessionId,
  artifact: toArtifactRef(row),
  purpose: row.purpose as ArtifactPurpose,
  turnId: row.turn_id as TurnId | null,
  toolInvocationId: row.tool_invocation_id as ToolInvocationId | null,
  runId: row.run_id,
  createdAt: sqlInstant.decode(row.created_at)
})

export class SessionArtifactPortSqlite extends ServiceMap.Service<SessionArtifactPortSqlite>()(
  "server/SessionArtifactPortSqlite",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient
      const sessionFileStore = yield* SessionFileStore

      const findByIdempotencyKey = SqlSchema.findOneOption({
        Request: Schema.Struct({ idempotencyKey: Schema.String }),
        Result: SessionArtifactRowSchema,
        execute: ({ idempotencyKey }) =>
          sql`
            SELECT
              sa.session_artifact_id,
              sa.session_id,
              sa.artifact_id,
              sa.purpose,
              sa.turn_id,
              sa.tool_invocation_id,
              sa.run_id,
              sa.created_at,
              a.sha256,
              a.media_type,
              a.bytes,
              a.preview_text
            FROM session_artifacts sa
            INNER JOIN artifacts a ON a.artifact_id = sa.artifact_id
            WHERE sa.idempotency_key = ${idempotencyKey}
            LIMIT 1
          `.withoutTransform
      })

      const listBySession = SqlSchema.findAll({
        Request: ListBySessionRequest,
        Result: SessionArtifactRowSchema,
        execute: ({ sessionId }) =>
          sql`
            SELECT
              sa.session_artifact_id,
              sa.session_id,
              sa.artifact_id,
              sa.purpose,
              sa.turn_id,
              sa.tool_invocation_id,
              sa.run_id,
              sa.created_at,
              a.sha256,
              a.media_type,
              a.bytes,
              a.preview_text
            FROM session_artifacts sa
            INNER JOIN artifacts a ON a.artifact_id = sa.artifact_id
            WHERE sa.session_id = ${sessionId}
            ORDER BY sa.created_at ASC, sa.session_artifact_id ASC
          `.withoutTransform
      })

      const listBySessionAndPurpose = SqlSchema.findAll({
        Request: ListBySessionAndPurposeRequest,
        Result: SessionArtifactRowSchema,
        execute: ({ sessionId, purpose }) =>
          sql`
            SELECT
              sa.session_artifact_id,
              sa.session_id,
              sa.artifact_id,
              sa.purpose,
              sa.turn_id,
              sa.tool_invocation_id,
              sa.run_id,
              sa.created_at,
              a.sha256,
              a.media_type,
              a.bytes,
              a.preview_text
            FROM session_artifacts sa
            INNER JOIN artifacts a ON a.artifact_id = sa.artifact_id
            WHERE sa.session_id = ${sessionId}
              AND sa.purpose = ${purpose}
            ORDER BY sa.created_at ASC, sa.session_artifact_id ASC
          `.withoutTransform
      })

      const link: SessionArtifactPort["link"] = (
        sessionId,
        artifactRef,
        purpose,
        provenance
      ) =>
        Effect.gen(function*() {
          const turnId = provenance?.turnId ?? null
          const toolInvocationId = provenance?.toolInvocationId ?? null
          const runId = provenance?.runId ?? null
          const idempotencyKey = makeIdempotencyKey({
            sessionId,
            artifactId: artifactRef.artifactId,
            purpose,
            turnId,
            toolInvocationId,
            runId
          })
          const sessionArtifactId = `session-artifact:${crypto.randomUUID()}`

          yield* sql`
            INSERT OR IGNORE INTO session_artifacts (
              session_artifact_id,
              session_id,
              artifact_id,
              purpose,
              turn_id,
              tool_invocation_id,
              run_id,
              idempotency_key,
              created_at
            ) VALUES (
              ${sessionArtifactId},
              ${sessionId},
              ${artifactRef.artifactId},
              ${purpose},
              ${turnId},
              ${toolInvocationId},
              ${runId},
              ${idempotencyKey},
              CURRENT_TIMESTAMP
            )
          `.unprepared

          const row = yield* findByIdempotencyKey({ idempotencyKey }).pipe(
            Effect.map(Option.getOrNull)
          )
          if (row === null) {
            return
          }

          yield* sessionFileStore.writeArtifactLink(
            sessionId,
            row.session_artifact_id,
            {
              sessionArtifactId: row.session_artifact_id,
              sessionId,
              artifact: toArtifactRef(row),
              purpose,
              provenance: {
                turnId,
                toolInvocationId,
                runId
              },
              createdAt: row.created_at
            }
          )
        }).pipe(
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const listBySessionPort: SessionArtifactPort["listBySession"] = (
        sessionId,
        purpose
      ) =>
        (purpose === undefined
          ? listBySession({ sessionId })
          : listBySessionAndPurpose({ sessionId, purpose })
        ).pipe(
          Effect.map((rows) => rows.map(toSessionArtifactRecord)),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      return {
        link,
        listBySession: listBySessionPort
      } satisfies SessionArtifactPort
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
