import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export class UnrecoverableError extends S.TaggedError<UnrecoverableError>()(
  "UnrecoverableError",
  { message: S.String, stack: S.String, attributes: S.Any },
  HttpApiSchema.annotations({ status: 500 })
) {}

// Network
export class NotFoundError extends S.TaggedError<NotFoundError>()(
  "NotFoundError",
  { id: S.String, resource: S.String },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class UniqueError extends S.TaggedError<UniqueError>()(
  "UniqueError",
  { field: S.String, value: S.String },
  HttpApiSchema.annotations({ status: 409 })
) {}

// Database
export class DatabaseError extends S.TaggedError<DatabaseError>()(
  "DatabaseError",
  { message: S.String, cause: S.optional(S.Any) },
  HttpApiSchema.annotations({ status: 500 })
) {}

export class TransactionError extends S.TaggedError<TransactionError>()(
  "TransactionError",
  { message: S.String, operation: S.String },
  HttpApiSchema.annotations({ status: 500 })
) {}

export class ConnectionError extends S.TaggedError<ConnectionError>()(
  "ConnectionError",
  { message: S.String, path: S.optional(S.String) },
  HttpApiSchema.annotations({ status: 500 })
) {}

export class ParseError extends S.TaggedError<ParseError>()(
  "ParseError",
  { message: S.String },
  HttpApiSchema.annotations({ status: 400 })
) {}

export class UnauthorizedError extends S.TaggedError<UnauthorizedError>()(
  "UnauthorizedError",
  {
    reason: S.Literal("missing_session", "invalid_session", "expired_session", "auth_service_error"),
    message: S.String,
  },
  HttpApiSchema.annotations({ status: 401 })
) {}

export class ForbiddenError extends S.TaggedError<ForbiddenError>()(
  "ForbiddenError",
  {
    reason: S.Literal("permission_denied"),
    message: S.String,
    resource: S.optional(S.String),
    requiredPermission: S.optional(S.String),
  },
  HttpApiSchema.annotations({ status: 403 })
) {}
