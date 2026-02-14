/// <reference types="@cloudflare/workers-types" />
import type { DurableObjectState } from "@cloudflare/workers-types"
import { EventLogDurableObject } from "@effect/experimental/EventLogServer/Cloudflare"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"
import * as EventLogServer from "@effect/experimental/EventLogServer"
import * as EventLogRemote from "@effect/experimental/EventLogRemote"
import { layerStorageDo } from "../storage/StorageDo.js"
import { layerStorageD1 } from "../storage/StorageD1.js"
import type { SyncDoEnv } from "../types.js"

class SyncStorageUnavailableError extends Schema.TaggedError<SyncStorageUnavailableError>()(
  "SyncStorageUnavailableError",
  {
    message: Schema.String
  }
) {}

const unavailable = (message: string) =>
  Effect.fail(
    SyncStorageUnavailableError.make({
      message
    })
  )

const makeStorageLayer = (
  ctx: DurableObjectState,
  env: SyncDoEnv
): Layer.Layer<EventLogServer.Storage, never, never> =>
  Layer.unwrapEffect(
    Effect.gen(function*() {
      if (env.SYNC_STORAGE === "d1") {
        if (!env.SYNC_DB) {
          return yield* unavailable("SYNC_STORAGE is 'd1' but SYNC_DB is not bound.")
        }
        return layerStorageD1(env.SYNC_DB)
      }
      if (env.SYNC_STORAGE === "do") {
        if (!ctx.storage.sql) {
          return yield* unavailable(
            "SYNC_STORAGE is 'do' but Durable Object sqlite storage is not available."
          )
        }
        return layerStorageDo(ctx.storage.sql)
      }
      if (env.SYNC_DB) {
        return layerStorageD1(env.SYNC_DB)
      }
      if (!ctx.storage.sql) {
        return yield* unavailable(
          "Sync storage unavailable. Bind SYNC_DB or enable durable_object_sqlite."
        )
      }
      return layerStorageDo(ctx.storage.sql)
    }).pipe(Effect.orDie)
  )

export class SyncDurableObject extends EventLogDurableObject {
  private readonly debug: boolean
  private readonly storageReady: Promise<void>

  constructor(ctx: DurableObjectState, env: SyncDoEnv) {
    super({
      ctx,
      env,
      storageLayer: makeStorageLayer(ctx, env)
    })
    this.debug = env.SYNC_DEBUG === "1" || env.SYNC_DEBUG === "true"
    this.storageReady = this.runtime.runPromise(
      Effect.gen(function*() {
        yield* EventLogServer.Storage
      }).pipe(Effect.asVoid)
    )
  }

  override async fetch(): Promise<Response> {
    try {
      await this.storageReady
    } catch (error) {
      console.error("[sync-do] Storage init failed", error)
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: unknown }).message ?? "Storage unavailable")
          : "Storage unavailable"
      return new Response(message, { status: 503 })
    }
    return super.fetch()
  }

  webSocketOpen(_ws: WebSocket) {
    if (this.debug) {
      const peers = this.ctx.getWebSockets().length
      console.log("[sync-do] WebSocket open", { peers })
    }
  }

  override webSocketClose(_ws: WebSocket, code: number, reason: string) {
    if (this.debug) {
      const peers = this.ctx.getWebSockets().length
      console.log("[sync-do] WebSocket close", { code, reason, peers })
    }
    return super.webSocketClose(_ws, code, reason)
  }

  override webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (this.debug) {
      try {
        const bytes =
          message instanceof ArrayBuffer
            ? new Uint8Array(message)
            : new TextEncoder().encode(message)
        const request = EventLogRemote.decodeRequest(bytes)
        switch (request._tag) {
          case "WriteEntries": {
            console.log("[sync-do] WriteEntries", {
              id: request.id,
              publicKey: request.publicKey,
              entries: request.encryptedEntries.length,
              peers: this.ctx.getWebSockets().length
            })
            break
          }
          case "RequestChanges": {
            console.log("[sync-do] RequestChanges", {
              publicKey: request.publicKey,
              startSequence: request.startSequence,
              peers: this.ctx.getWebSockets().length
            })
            break
          }
          case "ChunkedMessage": {
            const [chunk, total] = request.part
            console.log("[sync-do] ChunkedMessage", {
              id: request.id,
              chunk,
              total,
              bytes: request.data.byteLength
            })
            break
          }
          case "StopChanges": {
            console.log("[sync-do] StopChanges", {
              publicKey: request.publicKey
            })
            break
          }
          case "Ping": {
            console.log("[sync-do] Ping", { id: request.id })
            break
          }
        }
      } catch (error) {
        console.warn("[sync-do] Failed to decode request", error)
      }
    }

    return super.webSocketMessage(ws, message)
  }
}
