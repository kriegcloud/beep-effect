import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";

export const USERNAME_ERROR_CODES = {
  INVALID_USERNAME_OR_PASSWORD: "invalid username or password",
  EMAIL_NOT_VERIFIED: "email not verified",
  UNEXPECTED_ERROR: "unexpected error",
  USERNAME_IS_ALREADY_TAKEN: "username is already taken. please try another.",
  USERNAME_TOO_SHORT: "username is too short",
  USERNAME_TOO_LONG: "username is too long",
  INVALID_USERNAME: "username is invalid",
};

export class InvalidUsernameOrPassword extends S.TaggedError<InvalidUsernameOrPassword>(
  "@beep/iam-domain/errors/username/InvalidUsernameOrPassword"
)(...makeErrorProps("INVALID_USERNAME_OR_PASSWORD")(USERNAME_ERROR_CODES.INVALID_USERNAME_OR_PASSWORD)) {}

class EmailNotVerified extends S.TaggedError<EmailNotVerified>("@beep/iam-domain/errors/username/EmailNotVerified")(
  ...makeErrorProps("EMAIL_NOT_VERIFIED")(USERNAME_ERROR_CODES.EMAIL_NOT_VERIFIED)
) {}

class UnexpectedError extends S.TaggedError<UnexpectedError>("@beep/iam-domain/errors/username/UnexpectedError")(
  ...makeErrorProps("UNEXPECTED_ERROR")(USERNAME_ERROR_CODES.UNEXPECTED_ERROR)
) {}

export class UsernameIsAlreadyTaken extends S.TaggedError<UsernameIsAlreadyTaken>(
  "@beep/iam-domain/errors/username/UsernameIsAlreadyTaken"
)(...makeErrorProps("USERNAME_IS_ALREADY_TAKEN")(USERNAME_ERROR_CODES.USERNAME_IS_ALREADY_TAKEN)) {}

export class UsernameTooShort extends S.TaggedError<UsernameTooShort>(
  "@beep/iam-domain/errors/username/UsernameTooShort"
)(...makeErrorProps("USERNAME_TOO_SHORT")(USERNAME_ERROR_CODES.USERNAME_TOO_SHORT)) {}

export class UsernameTooLong extends S.TaggedError<UsernameTooLong>("@beep/iam-domain/errors/username/UsernameTooLong")(
  ...makeErrorProps("USERNAME_TOO_LONG")(USERNAME_ERROR_CODES.USERNAME_TOO_LONG)
) {}

export class InvalidUsername extends S.TaggedError<InvalidUsername>("@beep/iam-domain/errors/username/InvalidUsername")(
  ...makeErrorProps("INVALID_USERNAME")(USERNAME_ERROR_CODES.INVALID_USERNAME)
) {}

export class UsernameErrors extends S.Union(
  InvalidUsernameOrPassword,
  EmailNotVerified,
  UnexpectedError,
  UsernameIsAlreadyTaken,
  UsernameTooShort,
  UsernameTooLong,
  InvalidUsername
) {}

export declare namespace UsernameErrors {
  export type Type = typeof UsernameErrors.Type;
  export type Encoded = typeof UsernameErrors.Encoded;
}
