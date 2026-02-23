/**
 * OrganizationInvitation - Invitation to join an organization
 *
 * Represents an invitation sent to a user (by email) to join an organization.
 * Invitations contain a token hash for security and track their lifecycle
 * from pending through accepted or revoked.
 *
 * Note: Invitations do not expire automatically - they remain pending until
 * accepted or revoked.
 *
 * @module membership/OrganizationInvitation
 */

import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as S from "effect/Schema";
import { FunctionalRoles } from "../authorization/FunctionalRole.ts";
import { InvitationId } from "./InvitationId.ts";
import { InvitationStatus } from "./InvitationStatus.ts";
/**
 * OrganizationInvitation - An invitation to join an organization
 *
 * Tracks:
 * - Email address of the invitee
 * - Role to be assigned upon acceptance
 * - Functional roles to be assigned upon acceptance
 * - Token hash for secure invitation acceptance
 * - Status lifecycle (pending → accepted/revoked)
 */
export class OrganizationInvitation extends S.Class<OrganizationInvitation>("OrganizationInvitation")({
  /**
   * Unique identifier for this invitation
   */
  id: InvitationId,

  /**
   * The organization the user is being invited to
   */
  organizationId: SharedEntityIds.OrganizationId,

  /**
   * Email address of the person being invited
   */
  email: S.String.pipe(
    S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    S.annotations({
      title: "Email",
      description: "Email address of the invitee",
    })
  ),

  /**
   * The base role to assign when the invitation is accepted
   * Note: 'owner' cannot be assigned via invitation - only via transfer
   */
  role: BS.StringLiteralKit("admin", "member", "viewer").annotations({
    title: "Role",
    description: "The role to assign when the invitation is accepted",
  }),

  /**
   * Functional roles to assign when the invitation is accepted
   */
  functionalRoles: FunctionalRoles,

  /**
   * SHA-256 hash of the invitation token
   * The raw token is sent to the invitee via email
   */
  tokenHash: S.String.annotations({
    title: "Token Hash",
    description: "SHA-256 hash of the invitation token",
  }),

  /**
   * Current status of the invitation
   */
  status: InvitationStatus,

  /**
   * When the invitation was accepted
   */
  acceptedAt: S.OptionFromNullOr(BS.DateTimeUtcFromAllAcceptable),

  /**
   * The user who accepted the invitation (may differ from email if user exists)
   */
  acceptedBy: S.OptionFromNullOr(SharedEntityIds.UserId),

  /**
   * When the invitation was revoked
   */
  revokedAt: S.OptionFromNullOr(BS.DateTimeUtcFromAllAcceptable),

  /**
   * Who revoked the invitation
   */
  revokedBy: S.OptionFromNullOr(SharedEntityIds.UserId),

  /**
   * When the invitation was created
   */
  createdAt: BS.DateTimeUtcFromAllAcceptable,

  /**
   * Who sent the invitation
   */
  invitedBy: SharedEntityIds.UserId,
}) {
  /**
   * Check if the invitation is still pending
   */
  isPending(): boolean {
    return this.status === "pending";
  }

  /**
   * Check if the invitation has been accepted
   */
  isAccepted(): boolean {
    return this.status === "accepted";
  }

  /**
   * Check if the invitation has been revoked
   */
  isRevoked(): boolean {
    return this.status === "revoked";
  }
}

/**
 * Type guard for OrganizationInvitation using S.is
 */
export const isOrganizationInvitation = S.is(OrganizationInvitation);

/**
 * InvitationRole - Roles that can be assigned via invitation
 *
 * Note: 'owner' role cannot be assigned via invitation - only transferred
 */
export const InvitationRole = BS.StringLiteralKit("admin", "member", "viewer").annotations({
  identifier: "InvitationRole",
  title: "Invitation Role",
  description: "A role that can be assigned via invitation (excludes owner)",
});

/**
 * The InvitationRole type
 */
export type InvitationRole = typeof InvitationRole.Type;
