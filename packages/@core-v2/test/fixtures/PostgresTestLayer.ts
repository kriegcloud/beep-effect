/**
 * PostgreSQL Test Layer Fixtures
 *
 * Shared layer composition for PostgreSQL integration tests.
 * Uses local Docker PostgreSQL by default, can be overridden via env vars.
 *
 * @module test/fixtures/PostgresTestLayer
 */

import * as Pg from "@effect/sql-drizzle/Pg"
import { PgClient } from "@effect/sql-pg"
import { Config, ConfigProvider, Layer } from "effect"

// =============================================================================
// Test Configuration
// =============================================================================

/**
 * Default test PostgreSQL configuration
 *
 * Uses localhost Docker instance by default.
 * Override with environment variables for Cloud SQL testing:
 * - TEST_POSTGRES_HOST
 * - TEST_POSTGRES_PORT
 * - TEST_POSTGRES_DATABASE
 * - TEST_POSTGRES_USER
 * - TEST_POSTGRES_PASSWORD
 */
export const PostgresTestConfig = ConfigProvider.fromMap(
  new Map([
    ["POSTGRES_HOST", process.env.TEST_POSTGRES_HOST ?? "localhost"],
    ["POSTGRES_PORT", process.env.TEST_POSTGRES_PORT ?? "5432"],
    ["POSTGRES_DATABASE", process.env.TEST_POSTGRES_DATABASE ?? "workflow"],
    ["POSTGRES_USER", process.env.TEST_POSTGRES_USER ?? "workflow"],
    ["POSTGRES_PASSWORD", process.env.TEST_POSTGRES_PASSWORD ?? "workflow"]
  ])
)

/**
 * PgClient layer with test configuration
 */
export const PgClientTestLayer = PgClient.layerConfig({
  host: Config.string("POSTGRES_HOST"),
  port: Config.number("POSTGRES_PORT"),
  database: Config.string("POSTGRES_DATABASE"),
  username: Config.string("POSTGRES_USER"),
  password: Config.redacted("POSTGRES_PASSWORD"),
  ssl: Config.boolean("POSTGRES_SSL").pipe(Config.withDefault(false))
}).pipe(Layer.provide(Layer.setConfigProvider(PostgresTestConfig)))

/**
 * Drizzle layer with test PgClient
 *
 * Note: This layer only provides PgDrizzle. For repositories that also need
 * SqlClient directly (like EmbeddingRepository), use DrizzleAndSqlTestLayer.
 */
export const DrizzleTestLayer = Pg.layer.pipe(Layer.provide(PgClientTestLayer))

/**
 * Drizzle + SqlClient layer
 *
 * Some repositories (like EmbeddingRepository) require both PgDrizzle for ORM
 * queries and SqlClient for raw SQL. This layer provides both.
 */
export const DrizzleAndSqlTestLayer = Layer.mergeAll(
  Pg.layer,
  PgClientTestLayer
).pipe(Layer.provide(PgClientTestLayer))

// =============================================================================
// Helpers
// =============================================================================

/**
 * Create custom PostgreSQL test config
 *
 * @example
 * ```typescript
 * const CustomPgLayer = makePostgresTestLayer({
 *   host: "cloud-sql-instance",
 *   port: 5432,
 *   database: "test_db",
 *   username: "test_user",
 *   password: "test_password"
 * })
 * ```
 */
export const makePostgresTestLayer = (config: {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl?: boolean
}) => {
  const customConfig = ConfigProvider.fromMap(
    new Map([
      ["POSTGRES_HOST", config.host],
      ["POSTGRES_PORT", String(config.port)],
      ["POSTGRES_DATABASE", config.database],
      ["POSTGRES_USER", config.username],
      ["POSTGRES_PASSWORD", config.password],
      ["POSTGRES_SSL", String(config.ssl ?? false)]
    ])
  )

  return Pg.layer.pipe(
    Layer.provide(
      PgClient.layerConfig({
        host: Config.string("POSTGRES_HOST"),
        port: Config.number("POSTGRES_PORT"),
        database: Config.string("POSTGRES_DATABASE"),
        username: Config.string("POSTGRES_USER"),
        password: Config.redacted("POSTGRES_PASSWORD"),
        ssl: Config.boolean("POSTGRES_SSL").pipe(Config.withDefault(false))
      }).pipe(Layer.provide(Layer.setConfigProvider(customConfig)))
    )
  )
}
