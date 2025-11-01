import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";
export const BASE_ERROR_CODES = {
  USER_NOT_FOUND: "User not found",
  FAILED_TO_CREATE_USER: "Failed to create user",
  FAILED_TO_CREATE_SESSION: "Failed to create session",
  FAILED_TO_UPDATE_USER: "Failed to update user",
  FAILED_TO_GET_SESSION: "Failed to get session",
  INVALID_PASSWORD: "Invalid password",
  INVALID_EMAIL: "Invalid email",
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "Social account already linked",
  PROVIDER_NOT_FOUND: "Provider not found",
  INVALID_TOKEN: "Invalid token",
  ID_TOKEN_NOT_SUPPORTED: "id_token not supported",
  FAILED_TO_GET_USER_INFO: "Failed to get user info",
  USER_EMAIL_NOT_FOUND: "User email not found",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "User already exists. Use another email.",
  EMAIL_NOT_VERIFIED: "Email not verified",
  PASSWORD_TOO_SHORT: "Password too short",
  PASSWORD_TOO_LONG: "Password too long",
  USER_ALREADY_EXISTS: "User already exists",
  EMAIL_CAN_NOT_BE_UPDATED: "Email can not be updated",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Credential account not found",
  SESSION_EXPIRED: "Session expired. Re-authenticate to perform this action.",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "You can't unlink your last account",
  ACCOUNT_NOT_FOUND: "Account not found",
  USER_ALREADY_HAS_PASSWORD: "User already has a password. Provide that to delete the account.",
};

export class UserNotFound extends S.TaggedError<UserNotFound>("@beep/iam-domain/errors/core/UserNotFound")(
  ...makeErrorProps("USER_NOT_FOUND")(BASE_ERROR_CODES.USER_NOT_FOUND)
) {}

export class FailedToCreateUser extends S.TaggedError<FailedToCreateUser>(
  "@beep/iam-domain/errors/core/FailedToCreateUser"
)(...makeErrorProps("FAILED_TO_CREATE_USER")(BASE_ERROR_CODES.FAILED_TO_CREATE_USER)) {}

export class FailedToCreateSession extends S.TaggedError<FailedToCreateSession>(
  "@beep/iam-domain/errors/core/FailedToCreateSession"
)(...makeErrorProps("FAILED_TO_CREATE_SESSION")(BASE_ERROR_CODES.FAILED_TO_CREATE_SESSION)) {}

export class FailedToUpdateUser extends S.TaggedError<FailedToUpdateUser>(
  "@beep/iam-domain/errors/core/FailedToUpdateUser"
)(...makeErrorProps("FAILED_TO_UPDATE_USER")(BASE_ERROR_CODES.FAILED_TO_UPDATE_USER)) {}

export class FailedToGetSession extends S.TaggedError<FailedToGetSession>(
  "@beep/iam-domain/errors/core/FailedToGetSession"
)(...makeErrorProps("FAILED_TO_GET_SESSION")(BASE_ERROR_CODES.FAILED_TO_GET_SESSION)) {}

export class InvalidPassword extends S.TaggedError<InvalidPassword>("@beep/iam-domain/errors/core/InvalidPassword")(
  ...makeErrorProps("INVALID_PASSWORD")(BASE_ERROR_CODES.INVALID_PASSWORD)
) {}

export class InvalidEmail extends S.TaggedError<InvalidEmail>("@beep/iam-domain/errors/core/InvalidEmail")(
  ...makeErrorProps("INVALID_EMAIL")(BASE_ERROR_CODES.INVALID_EMAIL)
) {}

export class InvalidEmailOrPassword extends S.TaggedError<InvalidEmailOrPassword>(
  "@beep/iam-domain/errors/core/InvalidEmailOrPassword"
)(...makeErrorProps("INVALID_EMAIL_OR_PASSWORD")(BASE_ERROR_CODES.INVALID_EMAIL_OR_PASSWORD)) {}

export class SocialAccountAlreadyLinked extends S.TaggedError<SocialAccountAlreadyLinked>(
  "@beep/iam-domain/errors/core/SocialAccountAlreadyLinked"
)(...makeErrorProps("SOCIAL_ACCOUNT_ALREADY_LINKED")(BASE_ERROR_CODES.SOCIAL_ACCOUNT_ALREADY_LINKED)) {}

export class ProviderNotFound extends S.TaggedError<ProviderNotFound>("@beep/iam-domain/errors/core/ProviderNotFound")(
  ...makeErrorProps("PROVIDER_NOT_FOUND")(BASE_ERROR_CODES.PROVIDER_NOT_FOUND)
) {}

export class InvalidToken extends S.TaggedError<InvalidToken>("@beep/iam-domain/errors/core/InvalidToken")(
  ...makeErrorProps("INVALID_TOKEN")(BASE_ERROR_CODES.INVALID_TOKEN)
) {}

export class IdTokenNotSupported extends S.TaggedError<IdTokenNotSupported>(
  "@beep/iam-domain/errors/core/IdTokenNotSupported"
)(...makeErrorProps("ID_TOKEN_NOT_SUPPORTED")(BASE_ERROR_CODES.ID_TOKEN_NOT_SUPPORTED)) {}

export class FailedToGetUserInfo extends S.TaggedError<FailedToGetUserInfo>(
  "@beep/iam-domain/errors/core/FailedToGetUserInfo"
)(...makeErrorProps("FAILED_TO_GET_USER_INFO")(BASE_ERROR_CODES.FAILED_TO_GET_USER_INFO)) {}

export class UserEmailNotFound extends S.TaggedError<UserEmailNotFound>(
  "@beep/iam-domain/errors/core/UserEmailNotFound"
)(...makeErrorProps("USER_EMAIL_NOT_FOUND")(BASE_ERROR_CODES.USER_EMAIL_NOT_FOUND)) {}

export class EmailNotVerified extends S.TaggedError<EmailNotVerified>("@beep/iam-domain/errors/core/EmailNotVerified")(
  ...makeErrorProps("EMAIL_NOT_VERIFIED")(BASE_ERROR_CODES.EMAIL_NOT_VERIFIED)
) {}

export class PasswordTooShort extends S.TaggedError<PasswordTooShort>("@beep/iam-domain/errors/core/PasswordTooShort")(
  ...makeErrorProps("PASSWORD_TOO_SHORT")(BASE_ERROR_CODES.PASSWORD_TOO_SHORT)
) {}

export class PasswordTooLong extends S.TaggedError<PasswordTooLong>("@beep/iam-domain/errors/core/PasswordTooLong")(
  ...makeErrorProps("PASSWORD_TOO_LONG")(BASE_ERROR_CODES.PASSWORD_TOO_LONG)
) {}

export class UserAlreadyExists extends S.TaggedError<UserAlreadyExists>(
  "@beep/iam-domain/errors/core/UserAlreadyExists"
)(...makeErrorProps("USER_ALREADY_EXISTS")(BASE_ERROR_CODES.USER_ALREADY_EXISTS)) {}

export class UserAlreadyExistsUseAnotherEmail extends S.TaggedError<UserAlreadyExistsUseAnotherEmail>(
  "@beep/iam-domain/errors/core/UserAlreadyExistsUseAnotherEmail"
)(...makeErrorProps("USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL")(BASE_ERROR_CODES.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL)) {}

export class EmailCanNotBeUpdated extends S.TaggedError<EmailCanNotBeUpdated>(
  "@beep/iam-domain/errors/core/EmailCanNotBeUpdated"
)(...makeErrorProps("EMAIL_CAN_NOT_BE_UPDATED")(BASE_ERROR_CODES.EMAIL_CAN_NOT_BE_UPDATED)) {}

export class CredentialAccountNotFound extends S.TaggedError<CredentialAccountNotFound>(
  "@beep/iam-domain/errors/core/CredentialAccountNotFound"
)(...makeErrorProps("CREDENTIAL_ACCOUNT_NOT_FOUND")(BASE_ERROR_CODES.CREDENTIAL_ACCOUNT_NOT_FOUND)) {}

export class SessionExpired extends S.TaggedError<SessionExpired>("@beep/iam-domain/errors/core/SessionExpired")(
  ...makeErrorProps("SESSION_EXPIRED")(BASE_ERROR_CODES.SESSION_EXPIRED)
) {}

export class FailedToUnlinkLastAccount extends S.TaggedError<FailedToUnlinkLastAccount>(
  "@beep/iam-domain/errors/core/FailedToUnlinkLastAccount"
)(...makeErrorProps("FAILED_TO_UNLINK_LAST_ACCOUNT")(BASE_ERROR_CODES.FAILED_TO_UNLINK_LAST_ACCOUNT)) {}

export class AccountNotFound extends S.TaggedError<AccountNotFound>("@beep/iam-domain/errors/core/AccountNotFound")(
  ...makeErrorProps("ACCOUNT_NOT_FOUND")(BASE_ERROR_CODES.ACCOUNT_NOT_FOUND)
) {}

export class UserAlreadyHasPassword extends S.TaggedError<UserAlreadyHasPassword>(
  "@beep/iam-domain/errors/core/UserAlreadyHasPassword"
)(...makeErrorProps("USER_ALREADY_HAS_PASSWORD")(BASE_ERROR_CODES.USER_ALREADY_HAS_PASSWORD)) {}

export class CoreError extends S.Union(
  UserNotFound,
  FailedToCreateUser,
  FailedToCreateSession,
  FailedToUpdateUser,
  FailedToGetSession,
  InvalidPassword,
  InvalidEmail,
  InvalidEmailOrPassword,
  SocialAccountAlreadyLinked,
  ProviderNotFound,
  InvalidToken,
  IdTokenNotSupported,
  FailedToGetUserInfo,
  UserEmailNotFound,
  EmailNotVerified,
  PasswordTooShort,
  PasswordTooLong,
  UserAlreadyExists,
  UserAlreadyExistsUseAnotherEmail,
  EmailCanNotBeUpdated,
  CredentialAccountNotFound,
  SessionExpired,
  FailedToUnlinkLastAccount,
  AccountNotFound,
  UserAlreadyHasPassword
) {}

export declare namespace CoreError {
  export type Type = typeof CoreError.Type;
  export type Encoded = typeof CoreError.Encoded;
}
