import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";
import * as CoreErrors from "./core.errors";
export const ANONYMOUS_ERROR_CODES = {
  FAILED_TO_CREATE_USER: "Failed to create user",
  COULD_NOT_CREATE_SESSION: "Could not create session",
  ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN_ANONYMOUSLY: "Anonymous users cannot sign in again anonymously",
};
export class CouldNotCreateSession extends S.TaggedError<CouldNotCreateSession>(
  "@beep/iam-domain/errors/anonymous/CouldNotCreateSession"
)(...makeErrorProps("COULD_NOT_CREATE_SESSION")(ANONYMOUS_ERROR_CODES.COULD_NOT_CREATE_SESSION)) {}

export class AnonymousUsersCannotSignInAgainAnonymously extends S.TaggedError<AnonymousUsersCannotSignInAgainAnonymously>(
  "@beep/iam-domain/errors/anonymous/AnonymousUsersCannotSignInAgainAnonymously"
)(
  ...makeErrorProps("ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN_ANONYMOUSLY")(
    ANONYMOUS_ERROR_CODES.ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN_ANONYMOUSLY
  )
) {}

export class AnonymousErrors extends S.Union(
  CoreErrors.FailedToCreateUser,
  CouldNotCreateSession,
  AnonymousUsersCannotSignInAgainAnonymously
) {}

export declare namespace AnonymousErrors {
  export type Type = typeof AnonymousErrors.Type;
  export type Encoded = typeof AnonymousErrors.Encoded;
}
