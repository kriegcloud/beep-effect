import { $SharedInfraId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SharedInfraId.create("Email/errors");

export class ResendErrorCode extends BS.StringLiteralKit(
  "missing_required_field",
  "invalid_idempotency_key",
  "invalid_idempotent_request",
  "concurrent_idempotent_requests",
  "invalid_access",
  "invalid_parameter",
  "invalid_region",
  "rate_limit_exceeded",
  "missing_api_key",
  "invalid_api_key",
  "invalid_from_address",
  "validation_error",
  "not_found",
  "method_not_allowed",
  "application_error",
  "internal_server_error"
) {}

// export class RawResendError extends S.declare(
//   (i: unknown): i is
// )
const isResendError = (i: unknown): i is ResendError =>
  P.isObject(i) &&
  P.hasProperty("message")(i) &&
  P.hasProperty("name")(i) &&
  P.hasProperty("statusCode")(i) &&
  P.or(P.isNull, P.isNumber)(i.statusCode) &&
  Str.isString(i.message) &&
  S.is(ResendErrorCode)(i.name);

export class ResendError extends S.TaggedError<ResendError>($I`ResendError`)("ResendError", {
  cause: S.Defect,
  message: S.optional(S.String),
  name: S.optional(ResendErrorCode),
  statusCode: S.optional(S.NullOr(S.Number)),
  payload: S.Unknown,
}) {
  static readonly new = (cause: unknown, payload?: any) => {
    if (isResendError(cause)) {
      return new ResendError({
        cause,
        message: cause.message,
        name: cause.name,
        statusCode: cause.statusCode,
        payload,
      });
    }
    return new ResendError({ cause, payload });
  };
}

export class EmailTemplateRenderError extends S.TaggedError<EmailTemplateRenderError>($I`EmailTemplateRenderError`)(
  "EmailTemplateRenderError",
  {
    operation: S.String,
    cause: S.Defect,
  }
) {}
