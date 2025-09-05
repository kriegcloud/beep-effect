import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export const ValidationResultError = BS.Struct({
  message: S.String,
  element: S.Object,
}).annotations({
  schemaId: Symbol.for("@beep/rules/ValidationResultError"),
  identifier: "ValidationResultError",
  title: "Validation Result Error",
  description: "Error object for a validation result",
});

export namespace ValidationResultError {
  export type Type = S.Schema.Type<typeof ValidationResultError>;
  export type Encoded = S.Schema.Encoded<typeof ValidationResultError>;
}

export const ValidationResult = BS.Struct({
  isValid: S.Boolean,
  error: S.OptionFromUndefinedOr(ValidationResultError),
}).annotations({
  schemaId: Symbol.for("@beep/rules/ValidationResult"),
  identifier: "ValidationResult",
  title: "Validation Result",
  description: "Validation result object",
});

export namespace ValidationResult {
  export type Type = S.Schema.Type<typeof ValidationResult>;
  export type Encoded = S.Schema.Encoded<typeof ValidationResult>;
}
