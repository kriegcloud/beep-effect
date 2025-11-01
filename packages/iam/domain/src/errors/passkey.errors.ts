import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";
export const PASSKEY_ERROR_CODES = {
  CHALLENGE_NOT_FOUND: "Challenge not found",
  YOU_ARE_NOT_ALLOWED_TO_REGISTER_THIS_PASSKEY: "You are not allowed to register this passkey",
  FAILED_TO_VERIFY_REGISTRATION: "Failed to verify registration",
  PASSKEY_NOT_FOUND: "Passkey not found",
  AUTHENTICATION_FAILED: "Authentication failed",
  UNABLE_TO_CREATE_SESSION: "Unable to create session",
  FAILED_TO_UPDATE_PASSKEY: "Failed to update passkey",
};

export class ChallengeNotFound extends S.TaggedError<ChallengeNotFound>(
  "@beep/iam-domain/errors/passkey/ChallengeNotFound"
)(...makeErrorProps("CHALLENGE_NOT_FOUND")(PASSKEY_ERROR_CODES.CHALLENGE_NOT_FOUND)) {}

export class YouAreNotAllowedToRegisterThisPasskey extends S.TaggedError<YouAreNotAllowedToRegisterThisPasskey>(
  "@beep/iam-domain/errors/passkey/YouAreNotAllowedToRegisterThisPasskey"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_REGISTER_THIS_PASSKEY")(
    PASSKEY_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_REGISTER_THIS_PASSKEY
  )
) {}

export class FailedToVerifyRegistration extends S.TaggedError<FailedToVerifyRegistration>(
  "@beep/iam-domain/errors/passkey/FailedToVerifyRegistration"
)(...makeErrorProps("FAILED_TO_VERIFY_REGISTRATION")(PASSKEY_ERROR_CODES.FAILED_TO_VERIFY_REGISTRATION)) {}

export class PasskeyNotFound extends S.TaggedError<PasskeyNotFound>("@beep/iam-domain/errors/passkey/PasskeyNotFound")(
  ...makeErrorProps("PASSKEY_NOT_FOUND")(PASSKEY_ERROR_CODES.PASSKEY_NOT_FOUND)
) {}

export class AuthenticationFailed extends S.TaggedError<AuthenticationFailed>(
  "@beep/iam-domain/errors/passkey/AuthenticationFailed"
)(...makeErrorProps("AUTHENTICATION_FAILED")(PASSKEY_ERROR_CODES.AUTHENTICATION_FAILED)) {}

export class UnableToCreateSession extends S.TaggedError<UnableToCreateSession>(
  "@beep/iam-domain/errors/passkey/UnableToCreateSession"
)(...makeErrorProps("UNABLE_TO_CREATE_SESSION")(PASSKEY_ERROR_CODES.UNABLE_TO_CREATE_SESSION)) {}

export class FailedToUpdatePasskey extends S.TaggedError<FailedToUpdatePasskey>(
  "@beep/iam-domain/errors/passkey/FailedToUpdatePasskey"
)(...makeErrorProps("FAILED_TO_UPDATE_PASSKEY")(PASSKEY_ERROR_CODES.FAILED_TO_UPDATE_PASSKEY)) {}

export class PasskeyErrors extends S.Union(
  ChallengeNotFound,
  YouAreNotAllowedToRegisterThisPasskey,
  FailedToVerifyRegistration,
  PasskeyNotFound,
  AuthenticationFailed,
  UnableToCreateSession,
  FailedToUpdatePasskey
) {}

export declare namespace PasskeyErrors {
  export type Type = typeof PasskeyErrors.Type;
  export type Encoded = typeof PasskeyErrors.Encoded;
}
