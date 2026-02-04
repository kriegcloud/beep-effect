/**
 * PostgreSQL Storage Layer for EventLogServer
 *
 * Provides persistent storage for the @effect/experimental EventLogServer
 * using PostgreSQL.
 *
 * Schema:
 * - event_log_server_identity: Server's stable RemoteId
 * - event_log_entries: Encrypted event entries per client publicKey
 *
 * @since 2.0.0
 * @module Runtime/Persistence/EventLogStorage
 */

import { type EntryId, makeRemoteId, type RemoteId } from "@effect/experimental/EventJournal"
import { EncryptedRemoteEntry } from "@effect/experimental/EventLogEncryption"
import * as EventLogServer from "@effect/experimental/EventLogServer"
import { SqlClient } from "@effect/sql"
import { Effect, Layer, Mailbox, PubSub, RcMap } from "effect"
import type * as Scope from "effect/Scope"

// =============================================================================
// SQL Migrations
// =============================================================================

const createServerIdentityTable = `
  CREATE TABLE IF NOT EXISTS event_log_server_identity (
    id INT PRIMARY KEY DEFAULT 1,
    remote_id BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
  )
`

const createEntriesTable = `
  CREATE TABLE IF NOT EXISTS event_log_entries (
    id BIGSERIAL PRIMARY KEY,
    public_key TEXT NOT NULL,
    sequence INT NOT NULL,
    entry_id BYTEA NOT NULL,
    iv BYTEA NOT NULL,
    encrypted_entry BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (public_key, entry_id)
  )
`

const createEntriesIndex = `
  CREATE INDEX IF NOT EXISTS idx_event_log_entries_public_key_sequence
  ON event_log_entries (public_key, sequence)
`

// =============================================================================
// Storage Implementation
// =============================================================================

/**
 * Create PostgreSQL-backed EventLogServer.Storage
 *
 * Features:
 * - Stable server RemoteId across restarts
 * - Persistent entry storage per client publicKey
 * - Deduplication via entry_id uniqueness
 * - Real-time change subscriptions via PubSub
 */
export const makeStoragePostgres: Effect.Effect<
  typeof EventLogServer.Storage.Service,
  never,
  SqlClient.SqlClient | Scope.Scope
> = Effect.gen(function*() {
  const sql = yield* SqlClient.SqlClient

  // Run migrations (only PostgreSQL supported)
  yield* sql.onDialect({
    pg: () =>
      Effect.all([
        sql.unsafe(createServerIdentityTable),
        sql.unsafe(createEntriesTable),
        sql.unsafe(createEntriesIndex)
      ]),
    mysql: () => Effect.void,
    mssql: () => Effect.void,
    sqlite: () => Effect.void,
    clickhouse: () => Effect.void
  }).pipe(Effect.orDie)

  // Get or create server identity
  const getOrCreateRemoteId = Effect.gen(function*() {
    const existing = yield* sql<{ remote_id: Uint8Array }>`
      SELECT remote_id FROM event_log_server_identity WHERE id = 1
    `.pipe(Effect.map((rows) => rows[0]))

    if (existing) {
      return existing.remote_id as RemoteId
    }

    // Create new identity
    const newId = makeRemoteId()
    yield* sql`
      INSERT INTO event_log_server_identity (id, remote_id)
      VALUES (1, ${newId as Uint8Array})
      ON CONFLICT (id) DO NOTHING
    `
    return newId
  }).pipe(Effect.orDie)

  const remoteId = yield* getOrCreateRemoteId

  // Track known entry IDs in memory (optimization for deduplication)
  const knownIds = new Map<string, number>()

  // PubSub for real-time change notifications per publicKey
  const pubsubs = yield* RcMap.make({
    lookup: (_publicKey: string) =>
      Effect.acquireRelease(
        PubSub.unbounded<EncryptedRemoteEntry>(),
        PubSub.shutdown
      ),
    idleTimeToLive: 60000
  })

  // Convert entry_id bytes to string for lookup
  const entryIdToString = (entryId: Uint8Array): string =>
    Array.from(entryId).map((b) => b.toString(16).padStart(2, "0")).join("")

  return EventLogServer.Storage.of({
    getId: Effect.succeed(remoteId),

    write: (publicKey, entries) =>
      Effect.gen(function*() {
        if (entries.length === 0) return [] as ReadonlyArray<EncryptedRemoteEntry>

        const active = yield* RcMap.keys(pubsubs)
        const pubsub = active.includes(publicKey)
          ? yield* RcMap.get(pubsubs, publicKey)
          : undefined

        const encryptedEntries: Array<EncryptedRemoteEntry> = []

        for (const entry of entries) {
          const idString = entryIdToString(entry.entryId)

          // Skip if already known
          if (knownIds.has(idString)) continue

          // Get next sequence for this publicKey
          const [{ max_seq }] = yield* sql<{ max_seq: number | null }>`
            SELECT MAX(sequence) as max_seq FROM event_log_entries WHERE public_key = ${publicKey}
          `
          const nextSequence = (max_seq ?? -1) + 1

          // Insert entry
          yield* sql`
            INSERT INTO event_log_entries (public_key, sequence, entry_id, iv, encrypted_entry)
            VALUES (${publicKey}, ${nextSequence}, ${entry.entryId as Uint8Array}, ${entry.iv as Uint8Array}, ${entry
            .encryptedEntry as Uint8Array})
            ON CONFLICT (public_key, entry_id) DO NOTHING
          `

          const encrypted = EncryptedRemoteEntry.make({
            sequence: nextSequence,
            entryId: entry.entryId,
            iv: entry.iv,
            encryptedEntry: entry.encryptedEntry
          })

          encryptedEntries.push(encrypted)
          knownIds.set(idString, encrypted.sequence)
          pubsub?.unsafeOffer(encrypted)
        }

        return encryptedEntries as ReadonlyArray<EncryptedRemoteEntry>
      }).pipe(Effect.scoped, Effect.orDie),

    entries: (publicKey, startSequence) =>
      Effect.gen(function*() {
        const rows = yield* sql<{
          sequence: number
          entry_id: Uint8Array
          iv: Uint8Array
          encrypted_entry: Uint8Array
        }>`
          SELECT sequence, entry_id, iv, encrypted_entry
          FROM event_log_entries
          WHERE public_key = ${publicKey} AND sequence >= ${startSequence}
          ORDER BY sequence ASC
        `

        return rows.map((row) =>
          EncryptedRemoteEntry.make({
            sequence: row.sequence,
            entryId: row.entry_id as EntryId,
            iv: row.iv,
            encryptedEntry: row.encrypted_entry
          })
        ) as ReadonlyArray<EncryptedRemoteEntry>
      }).pipe(Effect.orDie),

    changes: (publicKey, startSequence) =>
      Effect.gen(function*() {
        const mailbox = yield* Mailbox.make<EncryptedRemoteEntry>()
        const pubsub = yield* RcMap.get(pubsubs, publicKey)
        const queue = yield* pubsub.subscribe

        // Load existing entries from database
        const existing = yield* sql<{
          sequence: number
          entry_id: Uint8Array
          iv: Uint8Array
          encrypted_entry: Uint8Array
        }>`
          SELECT sequence, entry_id, iv, encrypted_entry
          FROM event_log_entries
          WHERE public_key = ${publicKey} AND sequence >= ${startSequence}
          ORDER BY sequence ASC
        `.pipe(Effect.orDie)

        yield* mailbox.offerAll(
          existing.map((row) =>
            EncryptedRemoteEntry.make({
              sequence: row.sequence,
              entryId: row.entry_id as EntryId,
              iv: row.iv,
              encryptedEntry: row.encrypted_entry
            })
          )
        )

        // Forward new entries from PubSub
        yield* queue.takeBetween(1, Number.MAX_SAFE_INTEGER).pipe(
          Effect.tap((chunk) => mailbox.offerAll(chunk)),
          Effect.forever,
          Effect.forkScoped,
          Effect.interruptible
        )

        return mailbox
      })
  })
})

// =============================================================================
// Layers
// =============================================================================

/**
 * PostgreSQL-backed EventLogServer.Storage layer
 *
 * Requires: SqlClient (from PgClientLive or similar)
 *
 * @example
 * ```ts
 * import { EventLogStoragePostgres } from "./Runtime/Persistence/EventLogStorage.js"
 * import { PgClientLive } from "./Runtime/Persistence/PostgresLayer.js"
 *
 * const StorageLayer = EventLogStoragePostgres.pipe(
 *   Layer.provide(PgClientLive)
 * )
 * ```
 */
export const EventLogStoragePostgres: Layer.Layer<
  EventLogServer.Storage,
  never,
  SqlClient.SqlClient
> = Layer.scoped(EventLogServer.Storage, makeStoragePostgres)
