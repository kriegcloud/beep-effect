import { $SharedDomainId } from "@beep/identity/packages";
import * as SharedEntityIds from "@beep/shared-domain/entity-ids/shared";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("entities/AuditLog/AuditLog.errors");

export class AuditLogNotFoundError extends S.TaggedError<AuditLogNotFoundError>()(
  $I`AuditLogNotFoundError`,
  {
    id: SharedEntityIds.AuditLogId,
  },
  $I.annotationsHttp("AuditLogNotFoundError", {
    status: 404,
    description: "Error when an audit log entry with the specified ID cannot be found.",
  })
) {}

export class AuditLogPermissionDeniedError extends S.TaggedError<AuditLogPermissionDeniedError>()(
  $I`AuditLogPermissionDeniedError`,
  {
    id: SharedEntityIds.AuditLogId,
  },
  $I.annotationsHttp("AuditLogPermissionDeniedError", {
    status: 403,
    description: "Error when the user does not have permission to access the audit log entry.",
  })
) {}

export const Errors = S.Union(AuditLogNotFoundError, AuditLogPermissionDeniedError);
export type Errors = typeof Errors.Type;
