/**
 * Wealth-management slice entity-id registry.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import * as EntityId from "../entity/EntityId.js";

const $I = $WealthManagementDomainId.create("identity/WealthManagement");
const make = EntityId.factory("wealth_management", $I);

/**
 * Household entity identifier.
 *
 * @example
 * ```ts
 * import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"
 *
 * console.log(WealthManagement.HouseholdId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const HouseholdId = make("household", {
  description: "Identifier for a wealth-management household entity.",
});

/**
 * Runtime type for {@link HouseholdId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: WealthManagement.HouseholdId = yield* S.decodeUnknownEffect(WealthManagement.HouseholdId)(1)
 *   return id
 * })
 * void program
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type HouseholdId = typeof HouseholdId.Type;

/**
 * Wealth client entity identifier.
 *
 * @example
 * ```ts
 * import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"
 *
 * console.log(WealthManagement.WealthClientId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const WealthClientId = make("wealth_client", {
  description: "Identifier for a wealth-management client entity.",
});

/**
 * Runtime type for {@link WealthClientId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: WealthManagement.WealthClientId = yield* S.decodeUnknownEffect(WealthManagement.WealthClientId)(1)
 *   return id
 * })
 * void program
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type WealthClientId = typeof WealthClientId.Type;

/**
 * Party entity identifier.
 *
 * @example
 * ```ts
 * import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"
 *
 * console.log(WealthManagement.PartyId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const PartyId = make("party", {
  description: "Identifier for a wealth-management party entity.",
});

/**
 * Runtime type for {@link PartyId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: WealthManagement.PartyId = yield* S.decodeUnknownEffect(WealthManagement.PartyId)(1)
 *   return id
 * })
 * void program
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type PartyId = typeof PartyId.Type;

/**
 * Account entity identifier.
 *
 * @example
 * ```ts
 * import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"
 *
 * console.log(WealthManagement.AccountId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const AccountId = make("account", {
  description: "Identifier for a wealth-management account entity.",
});

/**
 * Runtime type for {@link AccountId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: WealthManagement.AccountId = yield* S.decodeUnknownEffect(WealthManagement.AccountId)(1)
 *   return id
 * })
 * void program
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type AccountId = typeof AccountId.Type;
