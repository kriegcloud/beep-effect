import type {InvertKeyValue, ValueOf} from "./util-types";
import {BS} from "@beep/schema";
import * as S from "effect/Schema";

import * as Match from "effect/Match";
import * as F from "effect/Function";
// reference: https://www.jsonrpc.org/specification
const {
  Enum
} = BS.stringLiteralKit(
  "PARSE_ERROR",
  "BAD_REQUEST",
  "INTERNAL_SERVER_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "METHOD_NOT_SUPPORTED",
  "TIMEOUT",
  "CONFLICT",
  "PRECONDITION_FAILED",
  "PAYLOAD_TOO_LARGE",
  "UNSUPPORTED_MEDIA_TYPE",
  "UNPROCESSABLE_CONTENT",
  "TOO_MANY_REQUESTS",
  "CLIENT_CLOSED_REQUEST",
  "NOT_IMPLEMENTED",
  "BAD_GATEWAY",
  "SERVICE_UNAVAILABLE",
  "GATEWAY_TIMEOUT"
);

export const TRPC_ERROR_CODES_BY_KEY = {
  /**
   * Invalid JSON was received by the server.
   * An error occurred on the server while parsing the JSON text.
   */
  PARSE_ERROR: -32700,
  /**
   * The JSON sent is not a valid Request object.
   */
  BAD_REQUEST: -32600, // 400

  // Internal JSON-RPC error
  INTERNAL_SERVER_ERROR: -32603, // 500
  NOT_IMPLEMENTED: -32603, // 501
  BAD_GATEWAY: -32603, // 502
  SERVICE_UNAVAILABLE: -32603, // 503
  GATEWAY_TIMEOUT: -32603, // 504

  // Implementation specific errors
  UNAUTHORIZED: -32001, // 401
  FORBIDDEN: -32003, // 403
  NOT_FOUND: -32004, // 404
  METHOD_NOT_SUPPORTED: -32005, // 405
  TIMEOUT: -32008, // 408
  CONFLICT: -32009, // 409
  PRECONDITION_FAILED: -32012, // 412
  PAYLOAD_TOO_LARGE: -32013, // 413
  UNSUPPORTED_MEDIA_TYPE: -32015, // 415
  UNPROCESSABLE_CONTENT: -32022, // 422
  TOO_MANY_REQUESTS: -32029, // 429
  CLIENT_CLOSED_REQUEST: -32099, // 499
} as const;

export const TRPC_ERROR_CODES_BY_NUMBER: InvertKeyValue<
  typeof TRPC_ERROR_CODES_BY_KEY
> = {
  [-32700]: Enum.PARSE_ERROR,
  [-32600]: Enum.BAD_REQUEST,
  [-32603]: Enum.INTERNAL_SERVER_ERROR,
  [-32001]: Enum.UNAUTHORIZED,
  [-32003]: Enum.FORBIDDEN,
  [-32004]: Enum.NOT_FOUND,
  [-32005]: Enum.METHOD_NOT_SUPPORTED,
  [-32008]: Enum.TIMEOUT,
  [-32009]: Enum.CONFLICT,
  [-32012]: Enum.PRECONDITION_FAILED,
  [-32013]: Enum.PAYLOAD_TOO_LARGE,
  [-32015]: Enum.UNSUPPORTED_MEDIA_TYPE,
  [-32022]: Enum.UNPROCESSABLE_CONTENT,
  [-32029]: Enum.TOO_MANY_REQUESTS,
  [-32099]: Enum.CLIENT_CLOSED_REQUEST,
};

/**
 * JSON-RPC 2.0 Error codes
 *
 * `-32000` to `-32099` are reserved for implementation-defined server-errors.
 * For tRPC we're copying the last digits of HTTP 4XX errors.
 */
export const TRPCErrorCodeFromKey = S.transformLiterals(
  /**
   * Invalid JSON was received by the server.
   * An error occurred on the server while parsing the JSON text.
   */
  [Enum.PARSE_ERROR, -32700],
  /**
   * The JSON sent is not a valid Request object.
   */
  [Enum.BAD_REQUEST, -32600], // 400

  // Internal JSON-RPC error
  [Enum.INTERNAL_SERVER_ERROR, -32603], // 500
  [Enum.NOT_IMPLEMENTED, -32603], // 501
  [Enum.BAD_GATEWAY, -32603], // 502
  [Enum.SERVICE_UNAVAILABLE, -32603], // 503
  [Enum.GATEWAY_TIMEOUT, -32603], // 504

  // Implementation specific errors
  [Enum.UNAUTHORIZED, -32001], // 401
  [Enum.FORBIDDEN, -32003], // 403
  [Enum.NOT_FOUND, -32004], // 404
  [Enum.METHOD_NOT_SUPPORTED, -32005], // 405
  [Enum.TIMEOUT, -32008], // 408
  [Enum.CONFLICT, -32009], // 409
  [Enum.PRECONDITION_FAILED, -32012], // 412
  [Enum.PAYLOAD_TOO_LARGE, -32013], // 413
  [Enum.UNSUPPORTED_MEDIA_TYPE, -32015], // 415
  [Enum.UNPROCESSABLE_CONTENT, -32022], // 422
  [Enum.TOO_MANY_REQUESTS, -32029], // 429
  [Enum.CLIENT_CLOSED_REQUEST, -32099], // 499
);
export type TRPC_ERROR_CODE_NUMBER = ValueOf<typeof TRPC_ERROR_CODES_BY_KEY>;
export type TRPC_ERROR_CODE_KEY = keyof typeof TRPC_ERROR_CODES_BY_KEY;


const errorUnionMemberFields = F.flow(
  (code: TRPC_ERROR_CODE_KEY) => ({
    code: BS.toOptionalWithDefault(S.Literal(code))(code),
    cause: S.optional(S.Defect),
    message: S.optional(S.String),
    codeNumber: BS.toOptionalWithDefault(S.Literal(TRPC_ERROR_CODES_BY_KEY[code]))(TRPC_ERROR_CODES_BY_KEY[code])
  } as const)
);

export class TRPCParseError extends S.TaggedError<TRPCParseError>("@org/TRPCParseError")(
  Enum.PARSE_ERROR,
  errorUnionMemberFields(Enum.PARSE_ERROR)
) {}

export class TRPCBadRequestError extends S.TaggedError<TRPCBadRequestError>("@org/TRPCBadRequestError")(
  Enum.BAD_REQUEST,
  errorUnionMemberFields(Enum.BAD_REQUEST)
) {}

export class TRPCInternalServerError extends S.TaggedError<TRPCInternalServerError>("@org/TRPCInternalServerError")(
  Enum.INTERNAL_SERVER_ERROR,
  errorUnionMemberFields(Enum.INTERNAL_SERVER_ERROR)
) {}

export class TRPCUnauthorizedError extends S.TaggedError<TRPCUnauthorizedError>("@org/TRPCUnauthorizedError")(
  Enum.UNAUTHORIZED,
  errorUnionMemberFields(Enum.UNAUTHORIZED)
) {}

export class TRPCForbiddenError extends S.TaggedError<TRPCForbiddenError>("@org/TRPCForbiddenError")(
  Enum.FORBIDDEN,
  errorUnionMemberFields(Enum.FORBIDDEN)
) {}

export class TRPCNotFoundError extends S.TaggedError<TRPCNotFoundError>("@org/TRPCNotFoundError")(
  Enum.NOT_FOUND,
  errorUnionMemberFields(Enum.NOT_FOUND)
) {}

export class TRPCMethodNotFoundError extends S.TaggedError<TRPCMethodNotFoundError>("@org/TRPCMethodNotFoundError")(
  Enum.METHOD_NOT_SUPPORTED,
  errorUnionMemberFields(Enum.METHOD_NOT_SUPPORTED)
) {}

export class TRPCTimeoutError extends S.TaggedError<TRPCTimeoutError>("@org/TRPCTimeoutError")(
  Enum.TIMEOUT,
  errorUnionMemberFields(Enum.TIMEOUT)
) {}

export class TRPCConflictError extends S.TaggedError<TRPCConflictError>("@org/TRPCConflictError")(
  Enum.CONFLICT,
  errorUnionMemberFields(Enum.CONFLICT)
) {}

export class TRPCPreconditionFailedError extends S.TaggedError<TRPCPreconditionFailedError>("@org/TRPCPreconditionFailedError")(
  Enum.PRECONDITION_FAILED,
  errorUnionMemberFields(Enum.PRECONDITION_FAILED)
) {}

export class TRPCPayloadTooLargeError extends S.TaggedError<TRPCPayloadTooLargeError>("@org/TRPCPayloadTooLargeError")(
  Enum.PAYLOAD_TOO_LARGE,
  errorUnionMemberFields(Enum.PAYLOAD_TOO_LARGE)
) {}

export class TRPCUnsupportedMediaTypeError extends S.TaggedError<TRPCUnsupportedMediaTypeError>("@org/TRPCUnsupportedMediaTypeError")(
  Enum.UNSUPPORTED_MEDIA_TYPE,
  errorUnionMemberFields(Enum.UNSUPPORTED_MEDIA_TYPE)
) {}

export class TRPCUnprocessableContentError extends S.TaggedError<TRPCUnprocessableContentError>("@org/TRPCUnprocessableContentError")(
  Enum.UNPROCESSABLE_CONTENT,
  errorUnionMemberFields(Enum.UNPROCESSABLE_CONTENT)
) {}

export class TRPCTooManyRequestsError extends S.TaggedError<TRPCTooManyRequestsError>("@org/TRPCTooManyRequestsError")(
  Enum.TOO_MANY_REQUESTS,
  errorUnionMemberFields(Enum.TOO_MANY_REQUESTS)
) {}

export class TRPCClientClosedRequestError extends S.TaggedError<TRPCClientClosedRequestError>("@org/TRPCClientClosedRequestError")(
  Enum.CLIENT_CLOSED_REQUEST,
  errorUnionMemberFields(Enum.CLIENT_CLOSED_REQUEST)
) {}

export class TRPCNotImplementedError extends S.TaggedError<TRPCNotImplementedError>("@org/TRPCNotImplementedError")(
  Enum.NOT_IMPLEMENTED,
  errorUnionMemberFields(Enum.NOT_IMPLEMENTED)
) {}

export class TRPCBadGatewayError extends S.TaggedError<TRPCBadGatewayError>("@org/TRPCBadGatewayError")(
  Enum.BAD_GATEWAY,
  errorUnionMemberFields(Enum.BAD_GATEWAY)
) {}

export class TRPCServiceUnavailableError extends S.TaggedError<TRPCServiceUnavailableError>("@org/TRPCServiceUnavailableError")(
  Enum.SERVICE_UNAVAILABLE,
  errorUnionMemberFields(Enum.SERVICE_UNAVAILABLE)
) {}

export class TRPCGatewayTimeoutError extends S.TaggedError<TRPCGatewayTimeoutError>("@org/TRPCGatewayTimeoutError")(
  Enum.GATEWAY_TIMEOUT,
  errorUnionMemberFields(Enum.GATEWAY_TIMEOUT)
) {}

export class DiscriminatedTRPCError extends S.Union(
  TRPCParseError,
  TRPCBadRequestError,
  TRPCInternalServerError,
  TRPCUnauthorizedError,
  TRPCForbiddenError,
  TRPCNotFoundError,
  TRPCMethodNotFoundError,
  TRPCTimeoutError,
  TRPCConflictError,
  TRPCPreconditionFailedError,
  TRPCPayloadTooLargeError,
  TRPCUnsupportedMediaTypeError,
  TRPCUnprocessableContentError,
  TRPCTooManyRequestsError,
  TRPCClientClosedRequestError,
  TRPCNotImplementedError,
  TRPCBadGatewayError,
  TRPCServiceUnavailableError,
  TRPCGatewayTimeoutError
) {
  static readonly match = Match.type<typeof DiscriminatedTRPCError.Type>
}






