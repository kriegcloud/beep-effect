import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";
import * as CoreErrors from "./core.errors";
export const EMAIL_OTP_ERROR_CODES = {
  OTP_EXPIRED: "otp expired",
  INVALID_OTP: "Invalid OTP",
  INVALID_EMAIL: "Invalid email",
  USER_NOT_FOUND: "User not found",
  TOO_MANY_ATTEMPTS: "Too many attempts",
};

export class OtpExpired extends S.TaggedError<OtpExpired>("@beep/iam-domain/errors/email-otp/OtpExpired")(
  ...makeErrorProps("OTP_EXPIRED")(EMAIL_OTP_ERROR_CODES.OTP_EXPIRED)
) {}

export class InvalidOtp extends S.TaggedError<InvalidOtp>("@beep/iam-domain/errors/email-otp/InvalidOtp")(
  ...makeErrorProps("INVALID_OTP")(EMAIL_OTP_ERROR_CODES.INVALID_OTP)
) {}

export class TooManyAttempts extends S.TaggedError<TooManyAttempts>(
  "@beep/iam-domain/errors/email-otp/TooManyAttempts"
)(...makeErrorProps("TOO_MANY_ATTEMPTS")(EMAIL_OTP_ERROR_CODES.TOO_MANY_ATTEMPTS)) {}

export class EmailOtpErrors extends S.Union(
  OtpExpired,
  InvalidOtp,
  CoreErrors.InvalidEmail,
  CoreErrors.UserNotFound,
  TooManyAttempts
) {}

export declare namespace EmailOtpErrors {
  export type Type = typeof EmailOtpErrors.Type;
  export type Encoded = typeof EmailOtpErrors.Encoded;
}
