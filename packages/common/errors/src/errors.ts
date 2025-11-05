import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as Data from "effect/Data";
import * as S from "effect/Schema";

export class Es5Error extends Data.Error<{
  readonly name: string;
  readonly message: string;
  readonly stack?: string | undefined;
}> {}

export class UnrecoverableError extends S.TaggedError<UnrecoverableError>()(
  "UnrecoverableError",
  { message: S.String, stack: S.String, attributes: S.Any },
  HttpApiSchema.annotations({ status: 500 })
) {}

export declare namespace UnrecoverableError {
  export type Type = S.Schema.Type<typeof UnrecoverableError>;
  export type Encoded = S.Schema.Encoded<typeof UnrecoverableError>;
}

// Network
export class NotFoundError extends S.TaggedError<NotFoundError>()(
  "NotFoundError",
  { id: S.String, resource: S.String },
  HttpApiSchema.annotations({ status: 404 })
) {}

export declare namespace NotFoundError {
  export type Type = S.Schema.Type<typeof NotFoundError>;
  export type Encoded = S.Schema.Encoded<typeof NotFoundError>;
}

export class UniqueViolationError extends S.TaggedError<UniqueViolationError>()(
  "UniqueViolationError",
  { field: S.String, value: S.String },
  HttpApiSchema.annotations({ status: 409 })
) {}

export declare namespace UniqueViolationError {
  export type Type = S.Schema.Type<typeof UniqueViolationError>;
  export type Encoded = S.Schema.Encoded<typeof UniqueViolationError>;
}

// Database
export class DatabaseError extends S.TaggedError<DatabaseError>()(
  "DatabaseError",
  { message: S.String, cause: S.optional(S.Any) },
  HttpApiSchema.annotations({ status: 500 })
) {}

export declare namespace DatabaseError {
  export type Type = S.Schema.Type<typeof DatabaseError>;
  export type Encoded = S.Schema.Encoded<typeof DatabaseError>;
}

export class TransactionError extends S.TaggedError<TransactionError>()(
  "TransactionError",
  { message: S.String, operation: S.String },
  HttpApiSchema.annotations({ status: 500 })
) {}

export declare namespace TransactionError {
  export type Type = S.Schema.Type<typeof TransactionError>;
  export type Encoded = S.Schema.Encoded<typeof TransactionError>;
}

export class ConnectionError extends S.TaggedError<ConnectionError>()(
  "ConnectionError",
  { message: S.String, path: S.optional(S.String) },
  HttpApiSchema.annotations({ status: 500 })
) {}

export declare namespace ConnectionError {
  export type Type = S.Schema.Type<typeof ConnectionError>;
  export type Encoded = S.Schema.Encoded<typeof ConnectionError>;
}

export class ParseError extends S.TaggedError<ParseError>()(
  "ParseError",
  { message: S.String },
  HttpApiSchema.annotations({ status: 400 })
) {}

export declare namespace ParseError {
  export type Type = S.Schema.Type<typeof ParseError>;
  export type Encoded = S.Schema.Encoded<typeof ParseError>;
}

export class Unauthorized extends S.TaggedError<Unauthorized>("Unauthorized")(
  "Unauthorized",
  {
    message: S.optional(S.String),
  },
  HttpApiSchema.annotations({
    status: 401,
    description: "Authentication is required and has failed or has not been provided",
  })
) {}

export declare namespace Unauthorized {
  export type Type = S.Schema.Type<typeof Unauthorized>;
  export type Encoded = S.Schema.Encoded<typeof Unauthorized>;
}

export class Forbidden extends S.TaggedError<Forbidden>("Forbidden")(
  "Forbidden",
  {
    message: S.optional(S.String),
  },
  HttpApiSchema.annotations({
    status: 403,
    description: "The server understood the request but refuses to authorize it",
  })
) {}

export declare namespace Forbidden {
  export type Type = S.Schema.Type<typeof Forbidden>;
  export type Encoded = S.Schema.Encoded<typeof Forbidden>;
}

export class UnknownError extends S.TaggedError<UnknownError>()("UnknownError", {
  cause: S.Defect,
  customMessage: S.optional(S.String),
}) {
  override get message() {
    return this.customMessage ?? "An unknown error has occurred.";
  }
}
