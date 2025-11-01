import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";
export const GENERIC_OAUTH_ERROR_CODES = {
  INVALID_OAUTH_CONFIGURATION: "Invalid OAuth configuration",
};

export class InvalidOAuthConfiguration extends S.TaggedError<InvalidOAuthConfiguration>(
  "@beep/iam-domain/errors/generic-oauth/InvalidOAuthConfiguration"
)(...makeErrorProps("INVALID_OAUTH_CONFIGURATION")(GENERIC_OAUTH_ERROR_CODES.INVALID_OAUTH_CONFIGURATION)) {}

export class GenericOAuthErrors extends S.Union(InvalidOAuthConfiguration) {}

export declare namespace GenericOAuthErrors {
  export type Type = typeof GenericOAuthErrors.Type;
  export type Encoded = typeof GenericOAuthErrors.Encoded;
}
