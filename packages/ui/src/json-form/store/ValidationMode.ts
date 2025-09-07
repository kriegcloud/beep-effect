import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const kit = BS.stringLiteralKit("ValidateAndShow", "ValidateAndHide", "NoValidation");

export class ValidationMode extends kit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui/form/store/ValidationMode"),
  identifier: "ValidationMode",
  title: "Validation Mode",
  description: "The validation mode to use.",
}) {}

export namespace ValidationMode {
  export type Type = S.Schema.Type<typeof ValidationMode>;
  export type Encoded = S.Schema.Encoded<typeof ValidationMode>;
}
