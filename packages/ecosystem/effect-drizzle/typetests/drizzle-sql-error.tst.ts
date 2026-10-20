import { expect, it } from "tstyche";
import type { migrate as migratePostgres } from "drizzle-orm/effect-postgres/migrator";
import type { EffectPgQueryEffectHKT } from "drizzle-orm/effect-postgres/session";
import type { migrate as migratePgSession } from "drizzle-orm/pg-core/effect";
import type { Error } from "effect/Effect";
import type { SqlError } from "effect/sql/SqlError";

// skipLibCheck turns an unresolvable SqlError import in Drizzle's declarations into `any`,
// which collapses the whole error union; `Extract` of `any` is `any`, never `SqlError`.
type PostgresMigrateError = Error<ReturnType<typeof migratePostgres>>;
type PgSessionMigrateError = Error<ReturnType<typeof migratePgSession<EffectPgQueryEffectHKT>>>;

it("types the Effect Postgres migrator's SqlError as Effect's SqlError", () => {
  expect<Extract<PostgresMigrateError, SqlError>>().type.toBe<SqlError>();
});

it("types the pg-core Effect session migrator's SqlError as Effect's SqlError", () => {
  expect<Extract<PgSessionMigrateError, SqlError>>().type.toBe<SqlError>();
});
