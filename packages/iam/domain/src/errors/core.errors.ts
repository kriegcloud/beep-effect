import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";

export class UserNotFound extends S.TaggedError<UserNotFound>("@beep/iam-domain/errors/core/UserNotFound")(
  ...makeErrorProps("USER_NOT_FOUND")("User not found")
) {}

export class FailedToCreateUser extends S.TaggedError<FailedToCreateUser>(
  "@beep/iam-domain/errors/core/FailedToCreateUser"
)(...makeErrorProps("FAILED_TO_CREATE_USER")("Failed to create user")) {}

export class FailedToCreateSession extends S.TaggedError<FailedToCreateSession>(
  "@beep/iam-domain/errors/core/FailedToCreateSession"
)(...makeErrorProps("FAILED_TO_CREATE_SESSION")("Failed to create session")) {}

export class FailedToUpdateUser extends S.TaggedError<FailedToUpdateUser>(
  "@beep/iam-domain/errors/core/FailedToUpdateUser"
)(...makeErrorProps("FAILED_TO_UPDATE_USER")("Failed to update user")) {}

export class FailedToGetSession extends S.TaggedError<FailedToGetSession>(
  "@beep/iam-domain/errors/core/FailedToGetSession"
)(...makeErrorProps("FAILED_TO_GET_SESSION")("Failed to get session")) {}

export class InvalidPassword extends S.TaggedError<InvalidPassword>("@beep/iam-domain/errors/core/InvalidPassword")(
  ...makeErrorProps("INVALID_PASSWORD")("Invalid password")
) {}

export class InvalidEmail extends S.TaggedError<InvalidEmail>("@beep/iam-domain/errors/core/InvalidEmail")(
  ...makeErrorProps("INVALID_EMAIL")("Invalid email")
) {}

export class InvalidEmailOrPassword extends S.TaggedError<InvalidEmailOrPassword>(
  "@beep/iam-domain/errors/core/InvalidEmailOrPassword"
)(...makeErrorProps("INVALID_EMAIL_OR_PASSWORD")("Invalid email or password")) {}

export class SocialAccountAlreadyLinked extends S.TaggedError<SocialAccountAlreadyLinked>(
  "@beep/iam-domain/errors/core/SocialAccountAlreadyLinked"
)(...makeErrorProps("SOCIAL_ACCOUNT_ALREADY_LINKED")("Social account already linked")) {}

export class ProviderNotFound extends S.TaggedError<ProviderNotFound>("@beep/iam-domain/errors/core/ProviderNotFound")(
  ...makeErrorProps("PROVIDER_NOT_FOUND")("Provider not found")
) {}

export class InvalidToken extends S.TaggedError<InvalidToken>("@beep/iam-domain/errors/core/InvalidToken")(
  ...makeErrorProps("INVALID_TOKEN")("Invalid token")
) {}

export class IdTokenNotSupported extends S.TaggedError<IdTokenNotSupported>(
  "@beep/iam-domain/errors/core/IdTokenNotSupported"
)(...makeErrorProps("ID_TOKEN_NOT_SUPPORTED")("id_token not supported")) {}

export class FailedToGetUserInfo extends S.TaggedError<FailedToGetUserInfo>(
  "@beep/iam-domain/errors/core/FailedToGetUserInfo"
)(...makeErrorProps("FAILED_TO_GET_USER_INFO")("Failed to get user info")) {}

export class UserEmailNotFound extends S.TaggedError<UserEmailNotFound>(
  "@beep/iam-domain/errors/core/UserEmailNotFound"
)(...makeErrorProps("USER_EMAIL_NOT_FOUND")("User email not found")) {}

export class EmailNotVerified extends S.TaggedError<EmailNotVerified>("@beep/iam-domain/errors/core/EmailNotVerified")(
  ...makeErrorProps("EMAIL_NOT_VERIFIED")("Email not verified")
) {}

export class PasswordTooShort extends S.TaggedError<PasswordTooShort>("@beep/iam-domain/errors/core/PasswordTooShort")(
  ...makeErrorProps("PASSWORD_TOO_SHORT")("Password too short")
) {}

export class PasswordTooLong extends S.TaggedError<PasswordTooLong>("@beep/iam-domain/errors/core/PasswordTooLong")(
  ...makeErrorProps("PASSWORD_TOO_LONG")("Password too long")
) {}

export class UserAlreadyExists extends S.TaggedError<UserAlreadyExists>(
  "@beep/iam-domain/errors/core/UserAlreadyExists"
)(...makeErrorProps("USER_ALREADY_EXISTS")("User already exists")) {}

export class UserAlreadyExistsUseAnotherEmail extends S.TaggedError<UserAlreadyExistsUseAnotherEmail>(
  "@beep/iam-domain/errors/core/UserAlreadyExistsUseAnotherEmail"
)(...makeErrorProps("USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL")("User already exists. Use another email.")) {}

export class EmailCanNotBeUpdated extends S.TaggedError<EmailCanNotBeUpdated>(
  "@beep/iam-domain/errors/core/EmailCanNotBeUpdated"
)(...makeErrorProps("EMAIL_CAN_NOT_BE_UPDATED")("Email can not be updated")) {}

export class CredentialAccountNotFound extends S.TaggedError<CredentialAccountNotFound>(
  "@beep/iam-domain/errors/core/CredentialAccountNotFound"
)(...makeErrorProps("CREDENTIAL_ACCOUNT_NOT_FOUND")("Credential account not found")) {}

export class SessionExpired extends S.TaggedError<SessionExpired>("@beep/iam-domain/errors/core/SessionExpired")(
  ...makeErrorProps("SESSION_EXPIRED")("Session expired. Re-authenticate to perform this action.")
) {}

export class FailedToUnlinkLastAccount extends S.TaggedError<FailedToUnlinkLastAccount>(
  "@beep/iam-domain/errors/core/FailedToUnlinkLastAccount"
)(...makeErrorProps("FAILED_TO_UNLINK_LAST_ACCOUNT")("You can't unlink your last account")) {}

export class AccountNotFound extends S.TaggedError<AccountNotFound>("@beep/iam-domain/errors/core/AccountNotFound")(
  ...makeErrorProps("ACCOUNT_NOT_FOUND")("Account not found")
) {}

export class UserAlreadyHasPassword extends S.TaggedError<UserAlreadyHasPassword>(
  "@beep/iam-domain/errors/core/UserAlreadyHasPassword"
)(...makeErrorProps("USER_ALREADY_HAS_PASSWORD")("User already has a password. Provide that to delete the account.")) {}

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
