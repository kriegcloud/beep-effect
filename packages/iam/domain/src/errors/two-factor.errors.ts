import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";
export const TWO_FACTOR_ERROR_CODES = {
  OTP_NOT_ENABLED: "OTP not enabled",
  OTP_HAS_EXPIRED: "OTP has expired",
  TOTP_NOT_ENABLED: "TOTP not enabled",
  TWO_FACTOR_NOT_ENABLED: "Two factor isn't enabled",
  BACKUP_CODES_NOT_ENABLED: "Backup codes aren't enabled",
  INVALID_BACKUP_CODE: "Invalid backup code",
  INVALID_CODE: "Invalid code",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "Too many attempts. Please request a new code.",
  INVALID_TWO_FACTOR_COOKIE: "Invalid two factor cookie",
};

export class OtpNotEnabled extends S.TaggedError<OtpNotEnabled>("@beep/iam-domain/errors/two-factor/OtpNotEnabled")(
  ...makeErrorProps("OTP_NOT_ENABLED")(TWO_FACTOR_ERROR_CODES.OTP_NOT_ENABLED)
) {}

export class OtpHasExpired extends S.TaggedError<OtpHasExpired>("@beep/iam-domain/errors/two-factor/OtpHasExpired")(
  ...makeErrorProps("OTP_HAS_EXPIRED")(TWO_FACTOR_ERROR_CODES.OTP_HAS_EXPIRED)
) {}

export class TotpNotEnabled extends S.TaggedError<TotpNotEnabled>("@beep/iam-domain/errors/two-factor/TotpNotEnabled")(
  ...makeErrorProps("TOTP_NOT_ENABLED")(TWO_FACTOR_ERROR_CODES.TOTP_NOT_ENABLED)
) {}

export class TwoFactorNotEnabled extends S.TaggedError<TwoFactorNotEnabled>(
  "@beep/iam-domain/errors/two-factor/TwoFactorNotEnabled"
)(...makeErrorProps("TWO_FACTOR_NOT_ENABLED")(TWO_FACTOR_ERROR_CODES.TWO_FACTOR_NOT_ENABLED)) {}

export class BackupCodesNotEnabled extends S.TaggedError<BackupCodesNotEnabled>(
  "@beep/iam-domain/errors/two-factor/BackupCodesNotEnabled"
)(...makeErrorProps("BACKUP_CODES_NOT_ENABLED")(TWO_FACTOR_ERROR_CODES.BACKUP_CODES_NOT_ENABLED)) {}

export class InvalidBackupCode extends S.TaggedError<InvalidBackupCode>(
  "@beep/iam-domain/errors/two-factor/InvalidBackupCode"
)(...makeErrorProps("INVALID_BACKUP_CODE")(TWO_FACTOR_ERROR_CODES.INVALID_BACKUP_CODE)) {}

export class InvalidCode extends S.TaggedError<InvalidCode>("@beep/iam-domain/errors/two-factor/InvalidCode")(
  ...makeErrorProps("INVALID_CODE")(TWO_FACTOR_ERROR_CODES.INVALID_CODE)
) {}

export class TooManyAttemptsRequestNewCode extends S.TaggedError<TooManyAttemptsRequestNewCode>(
  "@beep/iam-domain/errors/two-factor/TooManyAttemptsRequestNewCode"
)(...makeErrorProps("TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE")(TWO_FACTOR_ERROR_CODES.TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE)) {}

export class InvalidTwoFactorCookie extends S.TaggedError<InvalidTwoFactorCookie>(
  "@beep/iam-domain/errors/two-factor/InvalidTwoFactorCookie"
)(...makeErrorProps("INVALID_TWO_FACTOR_COOKIE")(TWO_FACTOR_ERROR_CODES.INVALID_TWO_FACTOR_COOKIE)) {}

export class TwoFactorErrors extends S.Union(
  OtpNotEnabled,
  OtpHasExpired,
  TotpNotEnabled,
  TwoFactorNotEnabled,
  BackupCodesNotEnabled,
  InvalidBackupCode,
  InvalidCode,
  TooManyAttemptsRequestNewCode,
  InvalidTwoFactorCookie
) {}

export declare namespace TwoFactorErrors {
  export type Type = typeof TwoFactorErrors.Type;
  export type Encoded = typeof TwoFactorErrors.Encoded;
}
