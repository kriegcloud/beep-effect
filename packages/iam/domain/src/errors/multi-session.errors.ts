import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";

export const MULTI_SESSION_ERROR_CODES = {
  INVALID_SESSION_TOKEN: "Invalid session token",
};

export class InvalidSessionToken extends S.TaggedError<InvalidSessionToken>(
  "@beep/iam-domain/errors/multi-session/InvalidSessionToken"
)(...makeErrorProps("INVALID_SESSION_TOKEN")(MULTI_SESSION_ERROR_CODES.INVALID_SESSION_TOKEN)) {}

export class MultiSessionErrors extends S.Union(InvalidSessionToken) {}

export declare namespace MultiSessionErrors {
  export type Type = typeof MultiSessionErrors.Type;
  export type Encoded = typeof MultiSessionErrors.Encoded;
}
