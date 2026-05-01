/**
 * Tenancy slice entity-id registry.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $TenancyDomainId } from "@beep/identity/packages";
import * as EntityId from "../entity/EntityId.js";

const $I = $TenancyDomainId.create("identity/Tenancy");
const make = EntityId.factory("tenancy", $I);

/**
 * Tenancy organization entity identifier.
 *
 * @example
 * ```ts
 * import * as Tenancy from "@beep/shared-domain/identity/Tenancy"
 *
 * console.log(Tenancy.OrganizationId.entityType)
 * ```
 *
 * @category entity ids
 * @since 0.0.0
 */
export const OrganizationId = make("organization", {
  description: "Identifier for a tenancy organization entity.",
});

/**
 * Runtime type for {@link OrganizationId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Tenancy from "@beep/shared-domain/identity/Tenancy"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Tenancy.OrganizationId = yield* S.decodeUnknownEffect(Tenancy.OrganizationId)(1)
 *   return id
 * })
 * void program
 * ```
 *
 * @category entity ids
 * @since 0.0.0
 */
export type OrganizationId = typeof OrganizationId.Type;

/**
 * Tenancy user entity identifier.
 *
 * @example
 * ```ts
 * import * as Tenancy from "@beep/shared-domain/identity/Tenancy"
 *
 * console.log(Tenancy.UserId.entityType)
 * ```
 *
 * @category entity ids
 * @since 0.0.0
 */
export const UserId = make("user", {
  description: "Identifier for a tenancy user entity.",
});

/**
 * Runtime type for {@link UserId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Tenancy from "@beep/shared-domain/identity/Tenancy"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Tenancy.UserId = yield* S.decodeUnknownEffect(Tenancy.UserId)(1)
 *   return id
 * })
 * void program
 * ```
 *
 * @category entity ids
 * @since 0.0.0
 */
export type UserId = typeof UserId.Type;

/**
 * Tenancy membership entity identifier.
 *
 * @example
 * ```ts
 * import * as Tenancy from "@beep/shared-domain/identity/Tenancy"
 *
 * console.log(Tenancy.MembershipId.entityType)
 * ```
 *
 * @category entity ids
 * @since 0.0.0
 */
export const MembershipId = make("membership", {
  description: "Identifier for a tenancy membership entity.",
});

/**
 * Runtime type for {@link MembershipId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Tenancy from "@beep/shared-domain/identity/Tenancy"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Tenancy.MembershipId = yield* S.decodeUnknownEffect(Tenancy.MembershipId)(1)
 *   return id
 * })
 * void program
 * ```
 *
 * @category entity ids
 * @since 0.0.0
 */
export type MembershipId = typeof MembershipId.Type;

/**
 * Tenancy principal entity identifier.
 *
 * @example
 * ```ts
 * import * as Tenancy from "@beep/shared-domain/identity/Tenancy"
 *
 * console.log(Tenancy.PrincipalId.entityType)
 * ```
 *
 * @category entity ids
 * @since 0.0.0
 */
export const PrincipalId = make("principal", {
  description: "Identifier for a tenancy principal entity.",
});

/**
 * Runtime type for {@link PrincipalId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Tenancy from "@beep/shared-domain/identity/Tenancy"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Tenancy.PrincipalId = yield* S.decodeUnknownEffect(Tenancy.PrincipalId)(1)
 *   return id
 * })
 * void program
 * ```
 *
 * @category entity ids
 * @since 0.0.0
 */
export type PrincipalId = typeof PrincipalId.Type;
