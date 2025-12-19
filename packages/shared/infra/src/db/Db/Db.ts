/**
 * Database service for shared domain entities with PostgreSQL integration.
 *
 * @since 0.1.0
 */
import { $SharedInfraId } from "@beep/identity/packages";
import { Db } from "@beep/shared-infra/internal/db";
import * as SharedDbSchema from "@beep/shared-tables/schema";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

const $I = $SharedInfraId.create("db/Db");

const serviceEffect: Db.PgClientServiceEffect<typeof SharedDbSchema> = Db.make({
  schema: SharedDbSchema,
});

/**
 * Type alias for the database service shape with typed schema operations.
 *
 * @example
 * ```typescript
 * import type { Shape } from "@beep/shared-infra/db/Db/Db"
 *
 * type MyDbService = Shape
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type Shape = Db.Shape<typeof SharedDbSchema>;

/**
 * Database service for shared domain entities with typed query utilities.
 *
 * Provides access to PostgreSQL database operations with Drizzle ORM integration,
 * schema-validated queries, and reactive query support.
 *
 * @example
 * ```typescript
 * import { SharedDb } from "@beep/shared-infra"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const { makeQueryWithSchema } = yield* SharedDb.SharedDb
 *
 *   const getUser = makeQueryWithSchema({
 *     inputSchema: S.Struct({ id: S.String }),
 *     outputSchema: S.Struct({ name: S.String }),
 *     queryFn: (execute, { id }) =>
 *       execute((client) => client.query.user.findFirst({ where: (t, { eq }) => eq(t.id, id) }))
 *   })
 *
 *   const user = yield* getUser({ id: "user-123" })
 * })
 * ```
 *
 * @category services
 * @since 0.1.0
 */
export class SharedDb extends Context.Tag($I`SharedDb`)<SharedDb, Db.Shape<typeof SharedDbSchema>>() {
  /**
   * Live layer providing SharedDb service with database connection dependencies.
   *
   * @example
   * ```typescript
   * import { SharedDb } from "@beep/shared-infra"
   * import * as Effect from "effect/Effect"
   *
   * const program = myEffect.pipe(Effect.provide(SharedDb.SharedDb.Live))
   * ```
   *
   * @category layers
   * @since 0.1.0
   */
  static readonly Live: Layer.Layer<SharedDb, never, Db.SliceDbRequirements> = Layer.scoped(this, serviceEffect);
}

export const layer: Layer.Layer<SharedDb, never, Db.SliceDbRequirements> = SharedDb.Live;
