import type {
  ArtifactRef,
  ArtifactStorePort
} from "@template/domain/ports"
import type { ArtifactId, SessionId } from "@template/domain/ids"
import type { ArtifactPurpose } from "@template/domain/status"
import { Effect, FileSystem, Layer, Path, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { gzipSync, gunzipSync } from "node:zlib"
import { AgentConfig } from "../ai/AgentConfig.js"
import { safeJsonStringify } from "../json/JsonCodec.js"
import { StorageLayout } from "./StorageLayout.js"

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

type ArtifactRow = {
  readonly artifact_id: string
  readonly sha256: string
  readonly media_type: string
  readonly bytes: number
  readonly compression: "none" | "gzip"
  readonly preview_text: string | null
}

const toSha256Hex = (bytes: Uint8Array): Effect.Effect<string> =>
  Effect.promise(async () => {
    const normalized = Uint8Array.from(bytes)
    const digest = await crypto.subtle.digest("SHA-256", normalized.buffer)
    return Array.from(
      new Uint8Array(digest),
      (value) => value.toString(16).padStart(2, "0")
    ).join("")
  })

const removeTempFile = (
  fs: FileSystem.FileSystem,
  filePath: string
): Effect.Effect<void> =>
  fs.remove(filePath).pipe(
    Effect.catchTag("PlatformError", () => Effect.void)
  )

const writeBlobIfMissing = (params: {
  readonly fs: FileSystem.FileSystem
  readonly pathService: Path.Path
  readonly targetPath: string
  readonly bytes: Uint8Array
}) =>
  Effect.gen(function*() {
    const alreadyExists = yield* params.fs.exists(params.targetPath)
    if (alreadyExists) {
      return
    }

    yield* params.fs.makeDirectory(
      params.pathService.dirname(params.targetPath),
      { recursive: true }
    )

    const tempPath = `${params.targetPath}.tmp-${crypto.randomUUID()}`
    yield* params.fs.writeFile(tempPath, params.bytes)
    yield* params.fs.rename(tempPath, params.targetPath).pipe(
      Effect.catchTag("PlatformError", () => Effect.void),
      Effect.ensuring(removeTempFile(params.fs, tempPath).pipe(Effect.orElseSucceed(() => void 0)))
    )
  })

const inferPreviewText = (
  bytes: Uint8Array,
  previewMaxBytes: number
): string | null => {
  if (bytes.length === 0) {
    return null
  }

  const maxBytes = Math.max(1, previewMaxBytes)
  return textDecoder.decode(bytes.slice(0, maxBytes))
}

const decodeArtifactRow = (row: ArtifactRow): ArtifactRef => ({
  artifactId: row.artifact_id as ArtifactId,
  sha256: row.sha256,
  mediaType: row.media_type,
  bytes: row.bytes,
  previewText: row.preview_text
})

export class ArtifactStoreFsCas extends ServiceMap.Service<ArtifactStoreFsCas>()(
  "server/storage/ArtifactStoreFsCas",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient
      const fs = yield* FileSystem.FileSystem
      const pathService = yield* Path.Path
      const storageLayout = yield* StorageLayout
      const agentConfig = yield* AgentConfig
      const artifactConfig = agentConfig.server.storage.artifacts

      const putBytes: ArtifactStorePort["putBytes"] = (
        _sessionId: SessionId,
        _purpose: ArtifactPurpose,
        payloadBytes: Uint8Array,
        metadata
      ) =>
        Effect.gen(function*() {
          const sha256 = yield* toSha256Hex(payloadBytes)
          const artifactId = (`artifact:sha256:${sha256}`) as ArtifactId
          const mediaType = metadata?.mediaType ?? "application/octet-stream"
          const previewText = metadata?.previewText ?? inferPreviewText(
            payloadBytes,
            artifactConfig.previewMaxBytes
          )
          const compression = artifactConfig.compression
          const bytesToPersist = compression === "gzip"
            ? new Uint8Array(gzipSync(payloadBytes))
            : payloadBytes

          const blobPath = storageLayout.artifactBlobPath(sha256)
          yield* writeBlobIfMissing({
            fs,
            pathService,
            targetPath: blobPath,
            bytes: bytesToPersist
          }).pipe(Effect.orDie)

          yield* sql`
            INSERT OR IGNORE INTO artifacts (
              artifact_id,
              sha256,
              media_type,
              bytes,
              compression,
              preview_text,
              created_at
            ) VALUES (
              ${artifactId},
              ${sha256},
              ${mediaType},
              ${payloadBytes.length},
              ${compression},
              ${previewText},
              CURRENT_TIMESTAMP
            )
          `.unprepared

          const rows = yield* sql`
            SELECT
              artifact_id,
              sha256,
              media_type,
              bytes,
              compression,
              preview_text
            FROM artifacts
            WHERE artifact_id = ${artifactId}
            LIMIT 1
          `.unprepared

          if (rows.length === 0) {
            return {
              artifactId,
              sha256,
              mediaType,
              bytes: payloadBytes.length,
              previewText
            } satisfies ArtifactRef
          }

          return decodeArtifactRow(rows[0] as ArtifactRow)
        }).pipe(
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const putJson: ArtifactStorePort["putJson"] = (
        sessionId,
        purpose,
        payload,
        metadata
      ) =>
        Effect.gen(function*() {
          const payloadJson = safeJsonStringify(payload)
          return yield* putBytes(
            sessionId,
            purpose,
            textEncoder.encode(payloadJson),
            metadata?.previewText === undefined
              ? {
                mediaType: metadata?.mediaType ?? "application/json"
              }
              : {
                mediaType: metadata?.mediaType ?? "application/json",
                previewText: metadata.previewText
              }
          )
        })

      const getBytes: ArtifactStorePort["getBytes"] = (artifactId) =>
        Effect.gen(function*() {
          const rows = yield* sql`
            SELECT
              artifact_id,
              sha256,
              media_type,
              bytes,
              compression,
              preview_text
            FROM artifacts
            WHERE artifact_id = ${artifactId}
            LIMIT 1
          `.unprepared

          if (rows.length === 0) {
            return yield* Effect.die(
              new Error(`Artifact not found: ${artifactId}`)
            )
          }

          const row = rows[0] as ArtifactRow
          const blobBytes = yield* fs.readFile(
            storageLayout.artifactBlobPath(row.sha256)
          )

          if (row.compression === "gzip") {
            return new Uint8Array(gunzipSync(blobBytes))
          }
          return blobBytes
        }).pipe(
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      return {
        putJson,
        putBytes,
        getBytes
      } satisfies ArtifactStorePort
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
