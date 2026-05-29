/**
 * Law-practice slice entity-id registry.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeDomainId } from "@beep/identity/packages";
import * as EntityId from "../entity/EntityId.js";

const $I = $LawPracticeDomainId.create("identity/LawPractice");
const make = EntityId.factory("law_practice", $I);

/**
 * Legal client entity identifier.
 *
 * @example
 * ```ts
 * import * as LawPractice from "@beep/shared-domain/identity/LawPractice"
 *
 * console.log(LawPractice.LegalClientId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const LegalClientId = make("legal_client", {
  description: "Identifier for a law-practice legal client entity.",
});

/**
 * Runtime type for {@link LegalClientId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as LawPractice from "@beep/shared-domain/identity/LawPractice"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: LawPractice.LegalClientId = yield* S.decodeUnknownEffect(LawPractice.LegalClientId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type LegalClientId = typeof LegalClientId.Type;

/**
 * Legal contact entity identifier.
 *
 * @example
 * ```ts
 * import * as LawPractice from "@beep/shared-domain/identity/LawPractice"
 *
 * console.log(LawPractice.LegalContactId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const LegalContactId = make("legal_contact", {
  description: "Identifier for a law-practice legal contact entity.",
});

/**
 * Runtime type for {@link LegalContactId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as LawPractice from "@beep/shared-domain/identity/LawPractice"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: LawPractice.LegalContactId = yield* S.decodeUnknownEffect(LawPractice.LegalContactId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type LegalContactId = typeof LegalContactId.Type;

/**
 * Matter entity identifier.
 *
 * @example
 * ```ts
 * import * as LawPractice from "@beep/shared-domain/identity/LawPractice"
 *
 * console.log(LawPractice.MatterId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const MatterId = make("matter", {
  description: "Identifier for a law-practice matter entity.",
});

/**
 * Runtime type for {@link MatterId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as LawPractice from "@beep/shared-domain/identity/LawPractice"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: LawPractice.MatterId = yield* S.decodeUnknownEffect(LawPractice.MatterId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type MatterId = typeof MatterId.Type;

/**
 * Patent asset entity identifier.
 *
 * @example
 * ```ts
 * import * as LawPractice from "@beep/shared-domain/identity/LawPractice"
 *
 * console.log(LawPractice.PatentAssetId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const PatentAssetId = make("patent_asset", {
  description: "Identifier for a law-practice patent asset entity.",
});

/**
 * Runtime type for {@link PatentAssetId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as LawPractice from "@beep/shared-domain/identity/LawPractice"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: LawPractice.PatentAssetId = yield* S.decodeUnknownEffect(LawPractice.PatentAssetId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type PatentAssetId = typeof PatentAssetId.Type;
