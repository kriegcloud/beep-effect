/**
 * Unified live layer combining all shared infrastructure services.
 *
 * @since 0.1.0
 */
import { EncryptionService } from "@beep/shared-domain/services";
import { UploadService } from "@beep/shared-infra/internal/upload";
import { Layer } from "effect";
import { Email } from "./Email";
import { Db } from "./internal/db";

/**
 * Union type of all shared infrastructure services.
 *
 * Includes database, email, encryption, and upload services.
 *
 * @example
 * ```typescript
 * import type { SharedServices } from "@beep/shared-infra"
 * import * as Effect from "effect/Effect"
 *
 * const program: Effect.Effect<void, never, SharedServices> = Effect.gen(function* () {
 *   const db = yield* SharedDb.SharedDb
 *   const email = yield* Email.ResendService
 * })
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type SharedServices =
  | Email.ResendService
  | Db.PgClientServices
  | EncryptionService.EncryptionService
  | UploadService;

/**
 * Live layer providing all shared infrastructure services.
 *
 * Combines database, email, encryption, and upload layers into a single dependency.
 *
 * @example
 * ```typescript
 * import { Live } from "@beep/shared-infra"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Use any shared service
 * }).pipe(Effect.provide(Live))
 * ```
 *
 * @category layers
 * @since 0.1.0
 */
export const Live: Layer.Layer<SharedServices, never, never> = Layer.empty.pipe(
  Layer.provideMerge(Email.ResendService.layer),
  Layer.provideMerge(Db.layer),
  Layer.provideMerge(EncryptionService.layer),
  Layer.provideMerge(UploadService.layer)
);
