/**
 * MembershipErrors - Domain errors for Membership domain
 *
 * These errors are used for Organization membership and invitation operations
 * and include HttpApiSchema annotations for automatic HTTP status code mapping.
 *
 * Note: Core membership errors are defined in Auth/AuthorizationErrors.ts and
 * re-exported here for the new import path. Additional membership-specific errors
 * that aren't authorization-related are defined directly in this file.
 *
 * @module membership/MembershipErrors
 */

import { HttpApiSchema } from "@effect/platform";
import * as S from "effect/Schema";

// =============================================================================
// Not Found Errors (404) - Defined here
// =============================================================================

/**
 * MemberNotFoundError - Organization member does not exist
 */
export class MemberNotFoundError extends S.TaggedError<MemberNotFoundError>()(
  "MemberNotFoundError",
  {
    memberId: S.String,
  },
  HttpApiSchema.annotations({ status: 404 })
) {
  override get message(): string {
    return `Member not found: ${this.memberId}`;
  }
}

export const isMemberNotFoundError = S.is(MemberNotFoundError);

/**
 * InvitationNotFoundError - Invitation does not exist
 */
export class InvitationNotFoundError extends S.TaggedError<InvitationNotFoundError>()(
  "InvitationNotFoundError",
  {
    invitationId: S.String,
  },
  HttpApiSchema.annotations({ status: 404 })
) {
  override get message(): string {
    return `Invitation not found: ${this.invitationId}`;
  }
}

export const isInvitationNotFoundError = S.is(InvitationNotFoundError);

/**
 * UserNotFoundByEmailError - User with email does not exist
 */
export class UserNotFoundByEmailError extends S.TaggedError<UserNotFoundByEmailError>()(
  "UserNotFoundByEmailError",
  {
    email: S.String,
  },
  HttpApiSchema.annotations({ status: 404 })
) {
  override get message(): string {
    return `User not found with email: ${this.email}`;
  }
}

export const isUserNotFoundByEmailError = S.is(UserNotFoundByEmailError);

// =============================================================================
// Validation Errors (400) - Defined here
// =============================================================================

/**
 * InvalidInvitationIdError - Invalid invitation ID format
 */
export class InvalidInvitationIdError extends S.TaggedError<InvalidInvitationIdError>()(
  "InvalidInvitationIdError",
  {
    value: S.String,
  },
  HttpApiSchema.annotations({ status: 400 })
) {
  override get message(): string {
    return `Invalid invitation ID format: ${this.value}`;
  }
}

export const isInvalidInvitationIdError = S.is(InvalidInvitationIdError);

// =============================================================================
// Business Rule Errors (422) - Defined here
// =============================================================================

/**
 * InvitationNotPendingError - Invitation is not in pending state
 */
export class InvitationNotPendingError extends S.TaggedError<InvitationNotPendingError>()(
  "InvitationNotPendingError",
  {
    invitationId: S.String,
    currentStatus: S.String,
  },
  HttpApiSchema.annotations({ status: 422 })
) {
  override get message(): string {
    return `Invitation ${this.invitationId} is not pending (current status: ${this.currentStatus})`;
  }
}

export const isInvitationNotPendingError = S.is(InvitationNotPendingError);

// =============================================================================
// Re-exports from Auth/AuthorizationErrors.ts
// =============================================================================

export {
  CannotTransferToNonAdminError,
  // Invitation errors
  InvalidInvitationError,
  InvitationAlreadyExistsError,
  InvitationExpiredError,
  isCannotTransferToNonAdminError,
  isInvalidInvitationError,
  isInvitationAlreadyExistsError,
  isInvitationExpiredError,
  isMemberNotSuspendedError,
  isMembershipNotActiveError,
  isMembershipNotFoundError,
  isOwnerCannotBeRemovedError,
  isOwnerCannotBeSuspendedError,
  isUserAlreadyMemberError,
  MemberNotSuspendedError,
  // Membership errors
  MembershipNotActiveError,
  MembershipNotFoundError,
  // Owner protection errors
  OwnerCannotBeRemovedError,
  OwnerCannotBeSuspendedError,
  UserAlreadyMemberError,
} from "../authorization/AuthorizationErrors.ts";
