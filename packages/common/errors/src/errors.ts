/**
 * Canonical Beep tagged errors for HTTP-aware responses and internal failures.
 *
 * @example
 * import * as Effect from "effect/Effect";
 * import { BeepError } from "@beep/errors/shared";
 *
 * export const program = Effect.fail(new BeepError.NotFoundError({ id: "id", resource: "item" }));
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as Data from "effect/Data";
import * as S from "effect/Schema";

/**
 * ES5-compatible error wrapper.
 *
 * @category Errors
 * @since 0.1.0
 */
export class Es5Error extends Data.Error<{
  readonly name: string;
  readonly message: string;
  readonly stack?: string | undefined;
}> {}

/**
 * Fatal error marker for unrecoverable failures.
 *
 * @category Errors
 * @since 0.1.0
 */
export class UnrecoverableError extends S.TaggedError<UnrecoverableError>()(
  "UnrecoverableError",
  { message: S.String, stack: S.String, attributes: S.Any },
  HttpApiSchema.annotations({ status: 500 })
) {}

/** @since 0.1.0 @category Errors */
export declare namespace UnrecoverableError {
  /**
   * @since 0.1.0
   * @category Errors
   */
  export type Type = S.Schema.Type<typeof UnrecoverableError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof UnrecoverableError>;
}

// Network
/**
 * Resource-not-found error.
 *
 * @category Errors
 * @since 0.1.0
 */
export class NotFoundError extends S.TaggedError<NotFoundError>()(
  "NotFoundError",
  { id: S.String, resource: S.String },
  HttpApiSchema.annotations({ status: 404 })
) {}

/** @since 0.1.0 @category Errors */
export declare namespace NotFoundError {
  /**
   * @since 0.1.0
   * @category Errors
   */
  export type Type = S.Schema.Type<typeof NotFoundError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof NotFoundError>;
}

/**
 * Conflict error when a unique field already exists.
 *
 * @category Errors
 * @since 0.1.0
 */
export class UniqueViolationError extends S.TaggedError<UniqueViolationError>()(
  "UniqueViolationError",
  { field: S.String, value: S.String },
  HttpApiSchema.annotations({ status: 409 })
) {}

/** @since 0.1.0 @category Errors */
export declare namespace UniqueViolationError {
  /**
   * @since 0.1.0
   * @category Errors
   */
  export type Type = S.Schema.Type<typeof UniqueViolationError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof UniqueViolationError>;
}

// Database
/**
 * Database failure wrapper with optional cause.
 *
 * @category Errors
 * @since 0.1.0
 */
export class DatabaseError extends S.TaggedError<DatabaseError>()(
  "DatabaseError",
  { message: S.String, cause: S.optional(S.Any) },
  HttpApiSchema.annotations({ status: 500 })
) {}

/** @since 0.1.0 @category Errors */
export declare namespace DatabaseError {
  /**
   * @since 0.1.0
   * @category Errors
   */
  export type Type = S.Schema.Type<typeof DatabaseError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof DatabaseError>;
}

/**
 * Transaction failure wrapper.
 *
 * @category Errors
 * @since 0.1.0
 */
export class TransactionError extends S.TaggedError<TransactionError>()(
  "TransactionError",
  { message: S.String, operation: S.String },
  HttpApiSchema.annotations({ status: 500 })
) {}

/** @since 0.1.0 @category Errors */
export declare namespace TransactionError {
  /**
   * @since 0.1.0
   * @category Errors
   */
  export type Type = S.Schema.Type<typeof TransactionError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof TransactionError>;
}

/**
 * Connection-channel failure wrapper.
 *
 * @category Errors
 * @since 0.1.0
 */
export class ConnectionError extends S.TaggedError<ConnectionError>()(
  "ConnectionError",
  { message: S.String, path: S.optional(S.String) },
  HttpApiSchema.annotations({ status: 500 })
) {}

/** @since 0.1.0 @category Errors */
export declare namespace ConnectionError {
  /**
   * @since 0.1.0
   * @category Errors
   */
  export type Type = S.Schema.Type<typeof ConnectionError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof ConnectionError>;
}

/**
 * Payload/decoding failure wrapper.
 *
 * @category Errors
 * @since 0.1.0
 */
export class ParseError extends S.TaggedError<ParseError>()(
  "ParseError",
  { message: S.String },
  HttpApiSchema.annotations({ status: 400 })
) {}

/** @since 0.1.0 @category Errors */
export declare namespace ParseError {
  /**
   * @since 0.1.0
   * @category Errors
   */
  export type Type = S.Schema.Type<typeof ParseError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof ParseError>;
}

/**
 * Unauthorized error for missing auth.
 *
 * @category Errors
 * @since 0.1.0
 */
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

/** @since 0.1.0 @category Errors */
export declare namespace Unauthorized {
  /**
   * @since 0.1.0
   * @category Errors
   */
  export type Type = S.Schema.Type<typeof Unauthorized>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof Unauthorized>;
}

/**
 * Forbidden error when auth present but action denied.
 *
 * @category Errors
 * @since 0.1.0
 */
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

/** @since 0.1.0 @category Errors */
export declare namespace Forbidden {
  /**
   * @since 0.1.0
   * @category Errors
   */
  export type Type = S.Schema.Type<typeof Forbidden>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof Forbidden>;
}

/**
 * Generic unknown error wrapper with optional custom message.
 *
 * @category Errors
 * @since 0.1.0
 */
export class UnknownError extends S.TaggedError<UnknownError>()("UnknownError", {
  cause: S.Defect,
  customMessage: S.optional(S.String),
}) {
  override get message() {
    return this.customMessage ?? "An unknown error has occurred.";
  }
}
