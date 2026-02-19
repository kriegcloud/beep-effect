/**
 * PolicyId - Branded type for authorization policy identifiers
 *
 * A branded UUID string type for uniquely identifying authorization policies.
 * Uses Effect's built-in UUID schema with additional branding for type safety.
 *
 * @module authorization/PolicyId
 */

import * as S from "effect/Schema";

/**
 * PolicyId - Branded UUIDv4 string for policy identification
 *
 * Uses Effect's built-in UUID schema which validates UUIDv4 format.
 */
export const PolicyId = S.UUID.pipe(
  S.brand("PolicyId"),
  S.annotations({
    identifier: "PolicyId",
    title: "Policy ID",
    description: "A unique identifier for an authorization policy (UUID format)",
  })
);

/**
 * The branded PolicyId type
 */
export type PolicyId = typeof PolicyId.Type;

/**
 * Type guard for PolicyId using Schema.is
 */
export const isPolicyId = S.is(PolicyId);
