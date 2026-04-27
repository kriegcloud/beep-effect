/**
 * Pure Organization domain behavior.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as O from "effect/Option";
import * as Shared from "../../identity/Shared.js";
import type { Model } from "./Organization.model.js";

/**
 * Test whether an Organization row is its own tenant root.
 *
 * @remarks
 * Organization is the one shared entity whose tenant scope is itself: a root
 * row satisfies `orgId` and `id` equality.
 *
 * @example
 * ```ts
 * import { isTenantRoot } from "@beep/shared-domain/entities/Organization/Organization.behavior"
 * import * as Shared from "@beep/shared-domain/identity/Shared"
 *
 * const id = 1 as Shared.OrganizationId
 * console.log(isTenantRoot({ id, orgId: id }))
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const isTenantRoot = (organization: Pick<Model, "id" | "orgId">): boolean =>
  Shared.OrganizationId.equivalence(organization.id, organization.orgId);

/**
 * Test whether an Organization belongs to a parent organization.
 *
 * @example
 * ```ts
 * import { hasParentOrganization } from "@beep/shared-domain/entities/Organization/Organization.behavior"
 * import * as O from "effect/Option"
 *
 * console.log(hasParentOrganization({ parentOrgId: O.none() }))
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const hasParentOrganization = (organization: Pick<Model, "parentOrgId">): boolean =>
  O.isSome(organization.parentOrgId);
