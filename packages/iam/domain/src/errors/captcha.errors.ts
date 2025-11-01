import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";

// These error codes are returned by the API
const EXTERNAL_ERROR_CODES = {
  VERIFICATION_FAILED: "Captcha verification failed",
  MISSING_RESPONSE: "Missing CAPTCHA response",
  UNKNOWN_ERROR: "Something went wrong",
};

// These error codes are only visible in the server logs
const INTERNAL_ERROR_CODES = {
  MISSING_SECRET_KEY: "Missing secret key",
  SERVICE_UNAVAILABLE: "CAPTCHA service unavailable",
};

export const CAPTCHA_ERROR_CODES = {
  ...EXTERNAL_ERROR_CODES,
  ...INTERNAL_ERROR_CODES,
} as const;

export class VerificationFailed extends S.TaggedError<VerificationFailed>(
  "@beep/iam-domain/errors/captcha/VerificationFailed"
)(...makeErrorProps("VERIFICATION_FAILED")(EXTERNAL_ERROR_CODES.VERIFICATION_FAILED)) {}

export class MissingResponse extends S.TaggedError<MissingResponse>("@beep/iam-domain/errors/captcha/MissingResponse")(
  ...makeErrorProps("MISSING_RESPONSE")(EXTERNAL_ERROR_CODES.MISSING_RESPONSE)
) {}

export class UnknownError extends S.TaggedError<UnknownError>("@beep/iam-domain/errors/captcha/UnknownError")(
  ...makeErrorProps("UNKNOWN_ERROR")(EXTERNAL_ERROR_CODES.UNKNOWN_ERROR)
) {}

export class MissingSecretKey extends S.TaggedError<MissingSecretKey>(
  "@beep/iam-domain/errors/captcha/MissingSecretKey"
)(...makeErrorProps("MISSING_SECRET_KEY")(INTERNAL_ERROR_CODES.MISSING_SECRET_KEY)) {}

export class ServiceUnavailable extends S.TaggedError<ServiceUnavailable>(
  "@beep/iam-domain/errors/captcha/ServiceUnavailable"
)(...makeErrorProps("SERVICE_UNAVAILABLE")(INTERNAL_ERROR_CODES.SERVICE_UNAVAILABLE)) {}

export class CaptchaErrors extends S.Union(
  VerificationFailed,
  MissingResponse,
  UnknownError,
  MissingSecretKey,
  ServiceUnavailable
) {}

export declare namespace CaptchaErrors {
  export type Type = typeof CaptchaErrors.Type;
  export type Encoded = typeof CaptchaErrors.Encoded;
}
