/**
 * Repository factory utilities for creating typed database repositories.
 *
 * @since 0.1.0
 */

/**
 * Namespace containing repository factory functions for creating typed database repositories.
 *
 * Provides utilities to construct base repository instances with CRUD operations and
 * schema-validated queries.
 *
 * @example
 * ```typescript
 * import { Repo } from "@beep/shared-server"
 * import { SharedEntityIds } from "@beep/shared-domain"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const UserSchema = S.Struct({ id: S.String, name: S.String })
 * const program = Effect.gen(function* () {
 *   const baseRepo = yield* Repo.make(
 *     SharedEntityIds.UserId,
 *     UserSchema,
 *     Effect.succeed({})
 *   )
 *   // Use baseRepo.insert, baseRepo.findById, etc.
 * })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
import * as InternalDb from "./internal/db";

export const Repo = InternalDb.Repo;
