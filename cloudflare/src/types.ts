import type { D1Database, DurableObjectNamespace } from "@cloudflare/workers-types"

export type SyncWorkerEnv = {
  readonly SYNC_DO: DurableObjectNamespace
  readonly SYNC_DB?: D1Database
  readonly SYNC_AUTH_TOKEN?: string
  readonly SYNC_ALLOW_QUERY_TOKEN?: string
  readonly SYNC_STORAGE?: "d1" | "do"
  readonly SYNC_DEBUG?: string
}

export type SyncDoEnv = {
  readonly SYNC_DB?: D1Database
  readonly SYNC_AUTH_TOKEN?: string
  readonly SYNC_STORAGE?: "d1" | "do"
  readonly SYNC_DEBUG?: string
}
