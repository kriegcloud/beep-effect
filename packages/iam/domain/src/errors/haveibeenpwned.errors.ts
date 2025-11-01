import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";
export const HAVEIBEENPWNED_ERROR_CODES = {
  PASSWORD_COMPROMISED: "The password you entered has been compromised. Please choose a different password.",
};

export class PasswordCompromised extends S.TaggedError<PasswordCompromised>(
  "@beep/iam-domain/errors/haveibeenpwned/PasswordCompromised"
)(...makeErrorProps("PASSWORD_COMPROMISED")(HAVEIBEENPWNED_ERROR_CODES.PASSWORD_COMPROMISED)) {}

export class HaveIBeenPwnedErrors extends S.Union(PasswordCompromised) {}

export declare namespace HaveIBeenPwnedErrors {
  export type Type = typeof HaveIBeenPwnedErrors.Type;
  export type Encoded = typeof HaveIBeenPwnedErrors.Encoded;
}
