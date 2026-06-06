/**
 * Typed technical errors for the ACP driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AcpId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as AcpSchema from "./_generated/schema.gen.ts";

const $I = $AcpId.create("errors");

/**
 * Failure raised when an ACP child process cannot be spawned.
 *
 * @example
 * ```ts
 * import { AcpSpawnError } from "@beep/acp/errors"
 *
 * const error = AcpSpawnError.make({ command: "acp-agent" })
 * console.log(error.message)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class AcpSpawnError extends TaggedErrorClass<AcpSpawnError>($I`AcpSpawnError`)(
  "AcpSpawnError",
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    command: S.optionalKey(S.String),
  },
  $I.annote("AcpSpawnError", {
    description: "Failure raised when an ACP child process cannot be spawned.",
  })
) {
  override get message() {
    return this.command !== undefined
      ? `Failed to spawn ACP process for command: ${this.command}`
      : "Failed to spawn ACP process";
  }
}

/**
 * Failure raised when an ACP process exits before the protocol completes.
 *
 * @example
 * ```ts
 * import { AcpProcessExitedError } from "@beep/acp/errors"
 *
 * const error = AcpProcessExitedError.make({ code: 1 })
 * console.log(error.message)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class AcpProcessExitedError extends TaggedErrorClass<AcpProcessExitedError>($I`AcpProcessExitedError`)(
  "AcpProcessExitedError",
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    code: S.optionalKey(S.Finite),
  },
  $I.annote("AcpProcessExitedError", {
    description: "Failure raised when an ACP process exits before the protocol completes.",
  })
) {
  override get message() {
    return this.code === undefined ? "ACP process exited" : `ACP process exited with code ${this.code}`;
  }
}

/**
 * Failure raised when ACP wire data cannot be encoded or decoded.
 *
 * @example
 * ```ts
 * import { AcpProtocolParseError } from "@beep/acp/errors"
 *
 * const error = AcpProtocolParseError.make({ detail: "bad json" })
 * console.log(error.message)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class AcpProtocolParseError extends TaggedErrorClass<AcpProtocolParseError>($I`AcpProtocolParseError`)(
  "AcpProtocolParseError",
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    detail: S.String,
  },
  $I.annote("AcpProtocolParseError", {
    description: "Failure raised when ACP wire data cannot be encoded or decoded.",
  })
) {
  override get message() {
    return `Failed to parse ACP protocol message: ${this.detail}`;
  }

  static readonly new: {
    (cause: unknown, detail: string): AcpProtocolParseError;
    (detail: string): (cause: unknown) => AcpProtocolParseError;
  } = dual(
    2,
    (cause: unknown, detail: string): AcpProtocolParseError =>
      AcpProtocolParseError.make({
        cause,
        detail,
      })
  );
}

/**
 * Failure raised by the ACP transport boundary.
 *
 * @example
 * ```ts
 * import { AcpTransportError } from "@beep/acp/errors"
 *
 * const error = AcpTransportError.make({ detail: "stream closed" })
 * console.log(error.detail)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class AcpTransportError extends TaggedErrorClass<AcpTransportError>($I`AcpTransportError`)(
  "AcpTransportError",
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    detail: S.String,
  },
  $I.annote("AcpTransportError", {
    description: "Failure raised by the ACP transport boundary.",
  })
) {}

/**
 * JSON-RPC request failure returned by an ACP peer.
 *
 * @example
 * ```ts
 * import { AcpRequestError } from "@beep/acp/errors"
 *
 * const error = AcpRequestError.methodNotFound("x/missing")
 * console.log(error.code)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class AcpRequestError extends TaggedErrorClass<AcpRequestError>($I`AcpRequestError`)(
  "AcpRequestError",
  {
    code: AcpSchema.ErrorCode,
    data: S.optionalKey(S.Unknown),
    errorMessage: S.String,
  },
  $I.annote("AcpRequestError", {
    description: "JSON-RPC request failure returned by an ACP peer.",
  })
) {
  override get message() {
    return this.errorMessage;
  }

  /**
   * Convert an ACP protocol error payload into a typed driver error.
   *
   * @example
   * ```ts
   * import { AcpRequestError } from "@beep/acp/errors"
   *
   * const error = AcpRequestError.fromProtocolError({
   *   code: -32601,
   *   message: "Method not found"
   * })
   * console.log(error.message)
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static fromProtocolError(error: AcpSchema.Error) {
    return AcpRequestError.make({
      code: error.code,
      errorMessage: error.message,
      ...R.getSomes({
        data: O.fromUndefinedOr(error.data),
      }),
    });
  }

  /**
   * Create a JSON-RPC parse error.
   *
   * @example
   * ```ts
   * import { AcpRequestError } from "@beep/acp/errors"
   *
   * const error = AcpRequestError.parseError()
   * console.log(error.code)
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static parseError(message = "Parse error", data?: unknown) {
    return AcpRequestError.make({
      code: -32700,
      errorMessage: message,
      ...R.getSomes({
        data: O.fromUndefinedOr(data),
      }),
    });
  }

  /**
   * Create a JSON-RPC invalid request error.
   *
   * @example
   * ```ts
   * import { AcpRequestError } from "@beep/acp/errors"
   *
   * const error = AcpRequestError.invalidRequest()
   * console.log(error.code)
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static invalidRequest(message = "Invalid request", data?: unknown) {
    return AcpRequestError.make({
      code: -32600,
      errorMessage: message,
      ...R.getSomes({
        data: O.fromUndefinedOr(data),
      }),
    });
  }

  /**
   * Create a JSON-RPC method-not-found error.
   *
   * @example
   * ```ts
   * import { AcpRequestError } from "@beep/acp/errors"
   *
   * const error = AcpRequestError.methodNotFound("x/test")
   * console.log(error.message)
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static methodNotFound(method: string) {
    return AcpRequestError.make({
      code: -32601,
      errorMessage: `Method not found: ${method}`,
    });
  }

  /**
   * Create a JSON-RPC invalid params error.
   *
   * @example
   * ```ts
   * import { AcpRequestError } from "@beep/acp/errors"
   *
   * const error = AcpRequestError.invalidParams("Invalid payload")
   * console.log(error.code)
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static invalidParams(message = "Invalid params", data?: unknown) {
    return AcpRequestError.make({
      code: -32602,
      errorMessage: message,
      ...R.getSomes({
        data: O.fromUndefinedOr(data),
      }),
    });
  }

  /**
   * Create a JSON-RPC internal error.
   *
   * @example
   * ```ts
   * import { AcpRequestError } from "@beep/acp/errors"
   *
   * const error = AcpRequestError.internalError()
   * console.log(error.code)
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static internalError(message = "Internal error", data?: unknown) {
    return AcpRequestError.make({
      code: -32603,
      errorMessage: message,
      ...R.getSomes({
        data: O.fromUndefinedOr(data),
      }),
    });
  }

  /**
   * Create an ACP authentication-required request error.
   *
   * @example
   * ```ts
   * import { AcpRequestError } from "@beep/acp/errors"
   *
   * const error = AcpRequestError.authRequired()
   * console.log(error.code)
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static authRequired(message = "Authentication required", data?: unknown) {
    return AcpRequestError.make({
      code: -32000,
      errorMessage: message,
      ...R.getSomes({
        data: O.fromUndefinedOr(data),
      }),
    });
  }

  /**
   * Create an ACP resource-not-found request error.
   *
   * @example
   * ```ts
   * import { AcpRequestError } from "@beep/acp/errors"
   *
   * const error = AcpRequestError.resourceNotFound()
   * console.log(error.code)
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static resourceNotFound(message = "Resource not found", data?: unknown) {
    return AcpRequestError.make({
      code: -32002,
      errorMessage: message,
      ...R.getSomes({
        data: O.fromUndefinedOr(data),
      }),
    });
  }

  /**
   * Convert this driver error to the ACP protocol error payload.
   *
   * @example
   * ```ts
   * import { AcpRequestError } from "@beep/acp/errors"
   *
   * const payload = AcpRequestError.methodNotFound("x/test").toProtocolError()
   * console.log(payload.message)
   * ```
   *
   * @category utilities
   * @since 0.0.0
   */
  toProtocolError() {
    return AcpSchema.Error.make({
      code: this.code,
      message: this.errorMessage,
      ...R.getSomes({
        data: O.fromUndefinedOr(this.data),
      }),
    });
  }
}

/**
 * Union of typed technical failures emitted by the ACP driver.
 *
 * @example
 * ```ts
 * import { AcpError, AcpRequestError } from "@beep/acp/errors"
 * import * as S from "effect/Schema"
 *
 * const isAcpError = S.is(AcpError)
 * console.log(isAcpError(AcpRequestError.methodNotFound("x/test")))
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const AcpError = S.Union([
  AcpRequestError,
  AcpSpawnError,
  AcpProcessExitedError,
  AcpProtocolParseError,
  AcpTransportError,
]).pipe(S.toTaggedUnion("_tag"));

/**
 * Type for {@link AcpError}.
 *
 * @example
 * ```ts
 * import type { AcpError } from "@beep/acp/errors"
 *
 * const inspect = (error: AcpError) => error._tag
 * console.log(inspect)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type AcpError = typeof AcpError.Type;
