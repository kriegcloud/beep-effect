/**
 * InvitationId - Branded type for invitation identifiers
 *
 * A branded UUID string type for uniquely identifying organization invitations.
 * Uses Effect's built-in UUID schema with additional branding for type safety.
 *
 * @module membership/InvitationId
 */

import * as S from "effect/Schema";

/**
 * InvitationId - Branded UUIDv4 string for invitation identification
 *
 * Uses Effect's built-in UUID schema which validates UUIDv4 format.
 */
export const InvitationId = S.UUID.pipe(
  S.brand("InvitationId"),
  S.annotations({
    identifier: "InvitationId",
    title: "Invitation ID",
    description: "A unique identifier for an organization invitation (UUID format)",
  })
);

/**
 * The branded InvitationId type
 */
export type InvitationId = typeof InvitationId.Type;

/**
 * Type guard for InvitationId using S.is
 */
export const isInvitationId = S.is(InvitationId);
