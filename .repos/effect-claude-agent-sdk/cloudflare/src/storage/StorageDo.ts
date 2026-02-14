import type { SqlStorage } from "@cloudflare/workers-types"
import * as Layer from "effect/Layer"
import * as SqlEventLogServer from "@effect/sql/SqlEventLogServer"
import * as SqliteClient from "@effect/sql-sqlite-do/SqliteClient"
import type * as EventLogServer from "@effect/experimental/EventLogServer"

export type StorageOptions = {
  readonly entryTablePrefix?: string
  readonly remoteIdTable?: string
  readonly insertBatchSize?: number
}

const withDefaults = (options?: StorageOptions) => ({
  entryTablePrefix: options?.entryTablePrefix ?? "effect_events",
  remoteIdTable: options?.remoteIdTable ?? "effect_remote_id",
  insertBatchSize: options?.insertBatchSize ?? 200
})

export const layerStorageDo = (
  db: SqlStorage,
  options?: StorageOptions
): Layer.Layer<EventLogServer.Storage> =>
  SqlEventLogServer.layerStorageSubtle(withDefaults(options)).pipe(
    Layer.provide(SqliteClient.layer({ db })),
    Layer.orDie
  )
