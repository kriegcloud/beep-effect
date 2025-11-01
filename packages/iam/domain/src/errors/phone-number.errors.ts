import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";
import * as EmailOtpErrors from "./email-otp.errors";
export const PHONE_NUMBER_ERROR_CODES = {
  INVALID_PHONE_NUMBER: "Invalid phone number",
  PHONE_NUMBER_EXIST: "Phone number already exists",
  INVALID_PHONE_NUMBER_OR_PASSWORD: "Invalid phone number or password",
  UNEXPECTED_ERROR: "Unexpected error",
  OTP_NOT_FOUND: "OTP not found",
  OTP_EXPIRED: "OTP expired",
  INVALID_OTP: "Invalid OTP",
  PHONE_NUMBER_NOT_VERIFIED: "Phone number not verified",
};

export class InvalidPhoneNumber extends S.TaggedError<InvalidPhoneNumber>(
  "@beep/iam-domain/errors/phone-number/InvalidPhoneNumber"
)(...makeErrorProps("INVALID_PHONE_NUMBER")(PHONE_NUMBER_ERROR_CODES.INVALID_PHONE_NUMBER)) {}

export class PhoneNumberExist extends S.TaggedError<PhoneNumberExist>(
  "@beep/iam-domain/errors/phone-number/PhoneNumberExist"
)(...makeErrorProps("PHONE_NUMBER_EXIST")(PHONE_NUMBER_ERROR_CODES.PHONE_NUMBER_EXIST)) {}

export class InvalidPhoneNumberOrPassword extends S.TaggedError<InvalidPhoneNumberOrPassword>(
  "@beep/iam-domain/errors/phone-number/InvalidPhoneNumberOrPassword"
)(...makeErrorProps("INVALID_PHONE_NUMBER_OR_PASSWORD")(PHONE_NUMBER_ERROR_CODES.INVALID_PHONE_NUMBER_OR_PASSWORD)) {}

export class UnexpectedError extends S.TaggedError<UnexpectedError>(
  "@beep/iam-domain/errors/phone-number/UnexpectedError"
)(...makeErrorProps("UNEXPECTED_ERROR")(PHONE_NUMBER_ERROR_CODES.UNEXPECTED_ERROR)) {}

export class OtpNotFound extends S.TaggedError<OtpNotFound>("@beep/iam-domain/errors/phone-number/OtpNotFound")(
  ...makeErrorProps("OTP_NOT_FOUND")(PHONE_NUMBER_ERROR_CODES.OTP_NOT_FOUND)
) {}

export class PhoneNumberNotVerified extends S.TaggedError<PhoneNumberNotVerified>(
  "@beep/iam-domain/errors/phone-number/PhoneNumberNotVerified"
)(...makeErrorProps("PHONE_NUMBER_NOT_VERIFIED")(PHONE_NUMBER_ERROR_CODES.PHONE_NUMBER_NOT_VERIFIED)) {}

export class PhoneNumberErrors extends S.Union(
  InvalidPhoneNumber,
  PhoneNumberExist,
  InvalidPhoneNumberOrPassword,
  UnexpectedError,
  OtpNotFound,
  EmailOtpErrors.OtpExpired,
  EmailOtpErrors.InvalidOtp,
  PhoneNumberNotVerified
) {}

export declare namespace PhoneNumberErrors {
  export type Type = typeof PhoneNumberErrors.Type;
  export type Encoded = typeof PhoneNumberErrors.Encoded;
}
