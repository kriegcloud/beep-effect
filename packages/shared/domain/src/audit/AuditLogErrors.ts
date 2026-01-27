/**
 * AuditLogErrors - Error types for audit logging operations
 *
 * Defines typed errors for audit log operations using Schema.TaggedError
 * for proper error handling throughout the application.
 *
 * @module audit/AuditLogErrors
 */

import { HttpApiSchema } from "@effect/platform";
import * as S from "effect/Schema";

/**
 * AuditLogError - Error when an audit log operation fails
 *
 * Used to wrap underlying persistence errors while preserving context.
 */
export class AuditLogError extends S.TaggedError<AuditLogError>()(
  "AuditLogError",
  {
    operation: S.String,
    cause: S.Defect,
  },
  HttpApiSchema.annotations({ status: 500 })
) {
  override get message(): string {
    return `Audit log error during ${this.operation}: ${String(this.cause)}`;
  }
}

/**
 * Type guard for AuditLogError
 */
export const isAuditLogError = S.is(AuditLogError);

/**
 * UserLookupError - Error when user lookup fails during audit logging
 *
 * Audit logs must include complete actor information for compliance.
 * If we cannot look up the user, the audit entry would be incomplete,
 * which could violate compliance requirements.
 */
export class UserLookupError extends S.TaggedError<UserLookupError>()(
  "UserLookupError",
  {
    userId: S.String,
    cause: S.Defect,
  },
  HttpApiSchema.annotations({ status: 500 })
) {
  override get message(): string {
    return `Failed to look up user ${this.userId} for audit log: ${String(this.cause)}`;
  }
}

/**
 * Type guard for UserLookupError
 */
export const isUserLookupError = S.is(UserLookupError);

/**
 * AuditDataCorruptionError - Error when audit log data cannot be parsed
 *
 * Audit data integrity is critical for compliance. If we cannot parse
 * stored audit changes JSON, this indicates data corruption that must
 * be surfaced rather than silently ignored.
 */
export class AuditDataCorruptionError extends S.TaggedError<AuditDataCorruptionError>()(
  "AuditDataCorruptionError",
  {
    entryId: S.String,
    field: S.String,
    cause: S.Defect,
  },
  HttpApiSchema.annotations({ status: 500 })
) {
  override get message(): string {
    return `Audit log data corruption in entry ${this.entryId}, field ${this.field}: ${String(this.cause)}`;
  }
}

/**
 * Type guard for AuditDataCorruptionError
 */
export const isAuditDataCorruptionError = S.is(AuditDataCorruptionError);
