/**
 * AuthorizationErrors - Tagged error types for authorization failure scenarios
 *
 * Defines all authorization-related errors for membership and permission checking.
 * Each error extends TaggedErrorClass.
 *
 * HTTP Status Codes (for API layer reference):
 * - 403 Forbidden: PermissionDeniedError, MembershipNotActiveError
 * - 404 Not Found: MembershipNotFoundError
 * - 400 Bad Request: InvalidInvitationError, InvitationExpiredError
 * - 409 Conflict: OwnerCannotBeRemovedError, CannotTransferToNonAdminError
 *
 * @module @beep/shared-domain/services/authorization/AuthorizationErrors
 */
import { $SharedDomainId } from "@beep/identity";
import { UUID } from "@beep/schema";
import { TaggedErrorClass } from "@beep/schema/TaggedErrorClass";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Shared } from "../../entity-ids/index.ts";
import { Action } from "./Action.ts";

const $I = $SharedDomainId.create("services/authorization/AuthorizationErrors.ts");

// =============================================================================
// 403 Forbidden Errors - Authorization failures
// =============================================================================

/**
 * PermissionDeniedError - User lacks required permission
 *
 * Returned when a user attempts an action they are not authorized to perform.
 *
 * HTTP Status: 403 Forbidden
 */
export class PermissionDeniedError extends TaggedErrorClass<PermissionDeniedError>("PermissionDeniedError")(
  "PermissionDeniedError",
  {
    action: Action.annotate({
      description: "The action that was denied",
    }),
    resourceType: S.String.annotate({
      description: "The type of resource being accessed",
    }),
    resourceId: S.OptionFromOptionalKey(UUID).annotate({
      description: "The specific resource ID, if applicable",
    }),
    reason: S.String.annotate({
      description: "A description of why the permission was denied",
    }),
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("PermissionDeniedError", {
    description: "PermissionDeniedError - User lacks required permission",
    status: 403,
  })
) {
  override get message(): string {
    const resource = O.isSome(this.resourceId) ? `${this.resourceType} (${this.resourceId.value})` : this.resourceType;
    return `Permission denied: cannot perform '${this.action}' on ${resource}. ${this.reason}`;
  }
}

/**
 * Type guard for PermissionDeniedError
 */
export const isPermissionDeniedError = S.is(PermissionDeniedError);

/**
 * MembershipNotActiveError - User's membership is suspended or removed
 *
 * Returned when a user attempts to access an organization where their
 * membership is not in an active state.
 *
 * HTTP Status: 403 Forbidden
 */
export class MembershipNotActiveError extends TaggedErrorClass<MembershipNotActiveError>()(
  "MembershipNotActiveError",
  {
    userId: Shared.UserId.annotate({
      description: "The user whose membership is not active",
    }),
    organizationId: Shared.OrganizationId.annotateKey({
      description: "The organization the user is attempting to access",
    }), // status: MembershipStatus.annotate({
    //   description: "The current status of the membership"
    // })
  },
  $I.annote("MembershipNotActiveError", {
    description: "MembershipNotActiveError - User's membership is not in an active state",
    status: 403,
  })
) {
  override get message(): string {
    return "Membership is not active. Access to this organization is denied.";
  }
}

/**
 * Type guard for MembershipNotActiveError
 */
export const isMembershipNotActiveError = S.is(MembershipNotActiveError);

// =============================================================================
// 404 Not Found Errors - Resource does not exist
// =============================================================================

/**
 * MembershipNotFoundError - User is not a member of the organization
 *
 * Returned when a user attempts to access an organization they are not a member of.
 *
 * HTTP Status: 404 Not Found
 */
export class MembershipNotFoundError extends TaggedErrorClass<MembershipNotFoundError>()(
  "MembershipNotFoundError",
  {
    userId: Shared.UserId.annotateKey({
      description: "The user who is not a member",
    }),
    organizationId: Shared.OrganizationId.annotateKey({
      description: "The organization the user is not a member of",
    }),
  },
  $I.annote("MembershipNotFoundError", {
    description: "MembershipNotFoundError - User is not a member of the organization",
    status: 404,
  })
) {
  override get message(): string {
    return `User is not a member of this organization`;
  }
}

/**
 * Type guard for MembershipNotFoundError
 */
export const isMembershipNotFoundError = S.is(MembershipNotFoundError);

/**
 * PolicyNotFoundError - Policy does not exist
 */
export class PolicyNotFoundError extends TaggedErrorClass<PolicyNotFoundError>()(
  "PolicyNotFoundError",
  {
    policyId: S.String,
  },
  $I.annote("PolicyNotFoundError", {
    description: "PolicyNotFoundError - Policy does not exist",
    status: 404,
  })
) {
  override get message(): string {
    return `Policy not found: ${this.policyId}`;
  }
}

export const isPolicyNotFoundError = S.is(PolicyNotFoundError);

// =============================================================================
// 400 Bad Request Errors - Invalid request data
// =============================================================================

/**
 * InvalidInvitationError - Invitation is invalid or not found
 *
 * Returned when attempting to accept or decline an invitation that is invalid.
 *
 * HTTP Status: 400 Bad Request
 */
export class InvalidInvitationError extends TaggedErrorClass<InvalidInvitationError>()(
  "InvalidInvitationError",
  {
    reason: S.String.annotate({
      description: "A description of why the invitation is invalid",
    }),
  },
  $I.annote("InvalidInvitationError", {
    description: "InvalidInvitationError - Invitation is invalid or not found",
    status: 400,
  })
) {
  override get message(): string {
    return `Invalid invitation: ${this.reason}`;
  }
}

/**
 * Type guard for InvalidInvitationError
 */
export const isInvalidInvitationError = S.is(InvalidInvitationError);

/**
 * InvitationExpiredError - Invitation has been revoked
 *
 * Returned when attempting to accept an invitation that has been revoked.
 * Note: Invitations do not expire by time, but can be revoked by admins.
 *
 * HTTP Status: 400 Bad Request
 */
export class InvitationExpiredError extends TaggedErrorClass<InvitationExpiredError>()(
  "InvitationExpiredError",
  {},
  $I.annote("InvitationExpiredError", {
    description: "InvitationExpiredError - Invitation has been revoked",
    status: 400,
  })
) {
  override get message(): string {
    return `This invitation has been revoked and can no longer be used`;
  }
}

/**
 * Type guard for InvitationExpiredError
 */
export const isInvitationExpiredError = S.is(InvitationExpiredError);

/**
 * InvalidPolicyIdError - Invalid policy ID format
 */
export class InvalidPolicyIdError extends TaggedErrorClass<InvalidPolicyIdError>()(
  "InvalidPolicyIdError",
  {
    value: S.String,
  },
  $I.annote("InvalidPolicyIdError", {
    description: "InvalidPolicyIdError - Invalid policy ID format",
    status: 400,
  })
) {
  override get message(): string {
    return `Invalid policy ID format: ${this.value}`;
  }
}

export const isInvalidPolicyIdError = S.is(InvalidPolicyIdError);

/**
 * InvalidPolicyConditionError - Invalid policy condition
 */
export class InvalidPolicyConditionError extends TaggedErrorClass<InvalidPolicyConditionError>()(
  "InvalidPolicyConditionError",
  {
    condition: S.String,
    reason: S.String,
  },
  $I.annote("InvalidPolicyConditionError", {
    status: 400,
    description: "InvalidPolicyConditionError - Invalid policy condition",
  })
) {
  override get message(): string {
    return `Invalid policy condition '${this.condition}': ${this.reason}`;
  }
}

export const isInvalidPolicyConditionError = S.is(InvalidPolicyConditionError);

/**
 * PolicyPriorityValidationError - Policy priority is out of valid range
 */
export class PolicyPriorityValidationError extends TaggedErrorClass<PolicyPriorityValidationError>()(
  "PolicyPriorityValidationError",
  {
    priority: S.Number,
    maxAllowed: S.Number,
  },
  $I.annote("PolicyPriorityValidationError", {
    status: 400,
    description: "PolicyPriorityValidationError - Policy priority is out of valid range",
  })
) {
  override get message(): string {
    return `Custom policy priority must be between 0 and ${this.maxAllowed}, got ${this.priority}`;
  }
}

export const isPolicyPriorityValidationError = S.is(PolicyPriorityValidationError);

/**
 * InvalidResourceTypeError - Invalid resource type for policy testing
 */
export class InvalidResourceTypeError extends TaggedErrorClass<InvalidResourceTypeError>($I`InvalidResourceTypeError`)(
  "InvalidResourceTypeError",
  {
    resourceType: S.String,
    validTypes: S.Array(S.String),
  },
  $I.annote("InvalidResourceTypeError", {
    description: "InvalidResourceTypeError - Invalid resource type for policy testing",
    status: 400,
  })
) {
  override get message(): string {
    return `Invalid resource type: ${this.resourceType}. Valid types: ${this.validTypes.join(", ")}`;
  }
}

export const isInvalidResourceTypeError = S.is(InvalidResourceTypeError);

// =============================================================================
// 409 Conflict Errors - Business rule violations
// =============================================================================

/**
 * OwnerCannotBeRemovedError - Cannot remove the organization owner
 *
 * Returned when attempting to remove the owner from an organization.
 * Ownership must be transferred before the owner can leave.
 *
 * HTTP Status: 409 Conflict
 */
export class OwnerCannotBeRemovedError extends TaggedErrorClass<OwnerCannotBeRemovedError>()(
  "OwnerCannotBeRemovedError",
  {
    organizationId: Shared.OrganizationId.annotateKey({
      description: "The organization where the owner cannot be removed",
    }),
  },
  $I.annote("OwnerCannotBeRemovedError", {
    status: 409,
    description: "OwnerCannotBeRemovedError - Cannot remove the organization" + " owner",
    documentation:
      " Returned when attempting to remove the owner from an organization.\n Ownership must be transferred before the owner can leave.\n\n HTTP Status: 409 Conflict",
  })
) {
  override get message(): string {
    return `The organization owner cannot be removed. Transfer ownership first.`;
  }
}

/**
 * Type guard for OwnerCannotBeRemovedError
 */
export const isOwnerCannotBeRemovedError = S.is(OwnerCannotBeRemovedError);

/**
 * OwnerCannotBeSuspendedError - Cannot suspend the organization owner
 *
 * Returned when attempting to suspend the owner of an organization.
 * Ownership must be transferred before the owner can be suspended.
 *
 * HTTP Status: 409 Conflict
 */
export class OwnerCannotBeSuspendedError extends TaggedErrorClass<OwnerCannotBeSuspendedError>(
  $I`OwnerCannotBeSuspendedError`
)(
  "OwnerCannotBeSuspendedError",
  {
    organizationId: Shared.OrganizationId.annotateKey({
      description: "The organization where the owner cannot be suspended",
    }),
  },
  $I.annote("OwnerCannotBeSuspendedError", {
    status: 409,
    description: "OwnerCannotBeSuspendedError - Cannot suspend the organization owner",
    documentation:
      "Returned when attempting to suspend the owner of an organization.\nOwnership must be transferred before the owner can be suspended.\n\nHTTP Status: 409 Conflict",
  })
) {
  override get message(): string {
    return `The organization owner cannot be suspended. Transfer ownership first.`;
  }
}

/**
 * Type guard for OwnerCannotBeSuspendedError
 */
export const isOwnerCannotBeSuspendedError = S.is(OwnerCannotBeSuspendedError);

/**
 * MemberNotSuspendedError - Cannot unsuspend a member who is not suspended
 *
 * Returned when attempting to unsuspend a member whose status is not 'suspended'.
 *
 * HTTP Status: 409 Conflict
 */
export class MemberNotSuspendedError extends TaggedErrorClass<MemberNotSuspendedError>($I`MemberNotSuspendedError`)(
  "MemberNotSuspendedError",
  {
    userId: Shared.UserId.annotateKey({
      description: "The user who is not suspended",
    }),
    organizationId: Shared.OrganizationId.annotateKey({
      description: "The organization",
    }), // currentStatus: MembershipStatus.annotate({
    //   description: "The current status of the membership"
    // })
  },
  $I.annote("MemberNotSuspendedError", {
    status: 409,
    description: "MemberNotSuspendedError - Cannot unsuspend a member who is not suspended",
    documentation:
      "Returned when attempting to unsuspend a member whose status is not 'suspended'.\n\nHTTP Status: 409 Conflict",
  })
) {
  override get message(): string {
    return "Cannot unsuspend member: member is not currently suspended.";
  }
}

/**
 * Type guard for MemberNotSuspendedError
 */
export const isMemberNotSuspendedError = S.is(MemberNotSuspendedError);

/**
 * CannotTransferToNonAdminError - Cannot transfer ownership to a non-admin
 *
 * Returned when attempting to transfer ownership to a user who is not an admin.
 * Only existing admins can receive ownership transfer.
 *
 * HTTP Status: 409 Conflict
 */
export class CannotTransferToNonAdminError extends TaggedErrorClass<CannotTransferToNonAdminError>(
  $I`CannotTransferToNonAdminError`
)(
  "CannotTransferToNonAdminError",
  {
    userId: Shared.UserId.annotateKey({
      description: "The user who is not an admin",
    }),
  },
  $I.annote("CannotTransferToNonAdminError", {
    description: "Cannot transfer ownership to a non-admin user. The target must be an admin.",
    documentation:
      "Returned when attempting to transfer ownership to a user who is not an admin.\n\nHTTP Status: 409 Conflict",
    status: 409,
  })
) {
  override get message(): string {
    return `Cannot transfer ownership to a non-admin user. The target must be an admin.`;
  }
}

/**
 * Type guard for CannotTransferToNonAdminError
 */
export const isCannotTransferToNonAdminError = S.is(CannotTransferToNonAdminError);

/**
 * InvitationAlreadyExistsError - Pending invitation already exists for this email
 *
 * Returned when attempting to send an invitation to an email that already has
 * a pending invitation for the same organization.
 *
 * HTTP Status: 409 Conflict
 */
export class InvitationAlreadyExistsError extends TaggedErrorClass<InvitationAlreadyExistsError>()(
  "InvitationAlreadyExistsError",
  {
    email: S.String.annotate({
      description: "The email that already has a pending invitation",
    }),
    organizationId: Shared.OrganizationId.annotateKey({
      description: "The organization with the existing invitation",
    }),
  },
  $I.annote("InvitationAlreadyExistsError", {
    status: 409,
    description: "InvitationAlreadyExistsError - Pending invitation already exists for this email",
    documentation:
      "Returned when attempting to send an invitation to an email that already has a pending invitation for the same organization.\n\nHTTP Status: 409 Conflict",
  })
) {
  override get message(): string {
    return `A pending invitation for ${this.email} already exists for this organization`;
  }
}

/**
 * Type guard for InvitationAlreadyExistsError
 */
export const isInvitationAlreadyExistsError = S.is(InvitationAlreadyExistsError);

/**
 * UserAlreadyMemberError - User is already a member of the organization
 *
 * Returned when attempting to add a user who is already a member.
 *
 * HTTP Status: 409 Conflict
 */
export class UserAlreadyMemberError extends TaggedErrorClass<UserAlreadyMemberError>($I`UserAlreadyMemberError`)(
  "UserAlreadyMemberError",
  {
    userId: Shared.UserId.annotateKey({
      description: "The user who is already a member",
    }),
    organizationId: Shared.OrganizationId.annotateKey({
      description: "The organization the user is already a member of",
    }),
  },
  $I.annote("UserAlreadyMemberError", {
    status: 409,
    description: "UserAlreadyMemberError - User is already a member of the organization",
    documentation:
      "Returned when attempting to add a user who is already a member of the organization.\n\nHTTP Status: 409 Conflict",
  })
) {
  override get message(): string {
    return `User is already a member of this organization`;
  }
}

/**
 * Type guard for UserAlreadyMemberError
 */
export const isUserAlreadyMemberError = S.is(UserAlreadyMemberError);

/**
 * PolicyAlreadyExistsError - Policy with same name already exists
 */
export class PolicyAlreadyExistsError extends TaggedErrorClass<PolicyAlreadyExistsError>()(
  "PolicyAlreadyExistsError",
  {
    name: S.String,
  },
  $I.annote("PolicyAlreadyExistsError", {
    description: "PolicyAlreadyExistsError - Policy with same name already exists",
    status: 409,
  })
) {
  override get message(): string {
    return `Policy with name '${this.name}' already exists`;
  }
}

export const isPolicyAlreadyExistsError = S.is(PolicyAlreadyExistsError);

/**
 * SystemPolicyCannotBeModifiedError - System policies cannot be modified or deleted
 */
export class SystemPolicyCannotBeModifiedError extends TaggedErrorClass<SystemPolicyCannotBeModifiedError>()(
  "SystemPolicyCannotBeModifiedError",
  {
    policyId: S.String,
    operation: S.String,
  },
  $I.annote("SystemPolicyCannotBeModifiedError", {
    description: "SystemPolicyCannotBeModifiedError - System policies cannot be modified or deleted",
    status: 409,
  })
) {
  override get message(): string {
    return `System policy ${this.policyId} cannot be ${this.operation}`;
  }
}

export const isSystemPolicyCannotBeModifiedError = S.is(SystemPolicyCannotBeModifiedError);

// =============================================================================
// 500 Internal Server Errors - System failures
// =============================================================================

/**
 * PolicyLoadError - Failed to load policies from the policy repository
 *
 * Returned when the authorization system cannot load policies from the database.
 * This is a critical error that should not be silently ignored - authorization
 * decisions must be based on actual policy data, not empty defaults.
 *
 * HTTP Status: 500 Internal Server Error
 */
export class PolicyLoadError extends TaggedErrorClass<PolicyLoadError>()(
  "PolicyLoadError",
  {
    organizationId: Shared.OrganizationId.annotateKey({
      description: "The organization for which policy loading failed",
    }),
    cause: S.Unknown.annotate({
      description: "The underlying error that caused the policy load to fail",
    }),
  },
  $I.annote("PolicyLoadError", {
    description: "PolicyLoadError - Failed to load policies from the policy repository",
    status: 500,
  })
) {
  override get message(): string {
    return `Failed to load authorization policies for organization: ${String(this.cause)}`;
  }
}

/**
 * Type guard for PolicyLoadError
 */
export const isPolicyLoadError = S.is(PolicyLoadError);

/**
 * AuthorizationAuditError - Failed to log authorization audit entry
 *
 * Returned when the authorization system cannot log a denial to the audit log.
 * Per ERROR_TRACKER.md, audit logging is essential for compliance and security
 * monitoring - failures must not be silently ignored.
 *
 * HTTP Status: 500 Internal Server Error
 */
export class AuthorizationAuditError extends TaggedErrorClass<AuthorizationAuditError>()(
  "AuthorizationAuditError",
  {
    operation: S.String.annotate({
      description: "The audit operation that failed",
    }),
    cause: S.Unknown.annotate({
      description: "The underlying error that caused the audit to fail",
    }),
  },
  $I.annote("AuthorizationAuditError", {
    description: "AuthorizationAuditError - Failed to log authorization audit entry",
    status: 500,
  })
) {
  override get message(): string {
    return `Failed to log authorization audit: ${this.operation} - ${String(this.cause)}`;
  }
}

/**
 * Type guard for AuthorizationAuditError
 */
export const isAuthorizationAuditError = S.is(AuthorizationAuditError);

// =============================================================================
// Union Types
// =============================================================================

/**
 * Union type for all authorization errors
 */
export type AuthorizationError =
  | PermissionDeniedError
  | MembershipNotActiveError
  | MembershipNotFoundError
  | InvalidInvitationError
  | InvitationExpiredError
  | OwnerCannotBeRemovedError
  | OwnerCannotBeSuspendedError
  | MemberNotSuspendedError
  | CannotTransferToNonAdminError
  | InvitationAlreadyExistsError
  | UserAlreadyMemberError
  | PolicyLoadError
  | AuthorizationAuditError
  | PolicyNotFoundError
  | InvalidPolicyIdError
  | InvalidPolicyConditionError
  | PolicyPriorityValidationError
  | InvalidResourceTypeError
  | PolicyAlreadyExistsError
  | SystemPolicyCannotBeModifiedError;

/**
 * HTTP status code mapping for API layer
 */
export const AUTHORIZATION_ERROR_STATUS_CODES = {
  // 403 Forbidden
  PermissionDeniedError: 403,
  MembershipNotActiveError: 403, // 404 Not Found
  MembershipNotFoundError: 404,
  PolicyNotFoundError: 404, // 400 Bad Request
  InvalidInvitationError: 400,
  InvitationExpiredError: 400,
  InvalidPolicyIdError: 400,
  InvalidPolicyConditionError: 400,
  PolicyPriorityValidationError: 400,
  InvalidResourceTypeError: 400, // 409 Conflict
  OwnerCannotBeRemovedError: 409,
  OwnerCannotBeSuspendedError: 409,
  MemberNotSuspendedError: 409,
  CannotTransferToNonAdminError: 409,
  InvitationAlreadyExistsError: 409,
  UserAlreadyMemberError: 409,
  PolicyAlreadyExistsError: 409,
  SystemPolicyCannotBeModifiedError: 409, // 500 Internal Server Error
  PolicyLoadError: 500,
  AuthorizationAuditError: 500,
} as const;
