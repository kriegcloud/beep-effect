/**
 * OrganizationMembershipId - Branded type for membership identifiers
 *
 * A branded UUID string type for uniquely identifying user-organization memberships.
 * Uses Effect's built-in UUID schema with additional branding for type safety.
 *
 * @module membership/OrganizationMembershipId
 */

import * as S from "effect/Schema";

/**
 * OrganizationMembershipId - Branded UUIDv4 string for membership identification
 *
 * Uses Effect's built-in UUID schema which validates UUIDv4 format.
 */
export const OrganizationMembershipId = S.UUID.pipe(
  S.brand("OrganizationMembershipId"),
  S.annotations({
    identifier: "OrganizationMembershipId",
    title: "Organization Membership ID",
    description: "A unique identifier for a user's membership in an organization (UUID format)",
  })
);

/**
 * The branded OrganizationMembershipId type
 */
export type OrganizationMembershipId = typeof OrganizationMembershipId.Type;

/**
 * Type guard for OrganizationMembershipId using S.is
 */
export const isOrganizationMembershipId = S.is(OrganizationMembershipId);
