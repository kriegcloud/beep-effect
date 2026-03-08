import type * as SqliteBunClient from "@effect/sql-sqlite-bun/SqliteClient"
import type * as SqliteNodeClient from "@effect/sql-sqlite-node/SqliteClient"
import { Effect, Layer } from "effect"
import type * as SqlClient from "effect/unstable/sql/SqlClient"

export interface SqliteRuntimeConfig {
  readonly filename: string
  readonly create?: boolean
  readonly readwrite?: boolean
  readonly disableWAL?: boolean
  readonly spanAttributes?: Record<string, unknown>
}

export const defaultDatabasePath = process.env.PERSONAL_AGENT_DB_PATH ?? "./personal-agent.sqlite"

export const layer = (
  options?: Partial<SqliteRuntimeConfig>
): Layer.Layer<
  SqlClient.SqlClient | SqliteBunClient.SqliteClient | SqliteNodeClient.SqliteClient
> => {
  const filename = options?.filename ?? defaultDatabasePath
  const disableWAL = options?.disableWAL ?? false
  const spanAttributes = options?.spanAttributes

  return Layer.unwrap(Effect.gen(function*() {
    if (typeof Bun !== "undefined") {
      const SqliteBun = yield* Effect.promise(
        () => import("@effect/sql-sqlite-bun/SqliteClient")
      )

      return SqliteBun.layer({
        filename,
        create: options?.create ?? true,
        readwrite: options?.readwrite ?? true,
        disableWAL,
        spanAttributes
      })
    }

    const SqliteNode = yield* Effect.promise(
      () => import("@effect/sql-sqlite-node/SqliteClient")
    )

    return SqliteNode.layer({
      filename,
      readonly: options?.readwrite === false,
      disableWAL,
      spanAttributes
    })
  }))
}
