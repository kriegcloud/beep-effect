import { BS } from "@beep/schema";
import * as O from "effect/Option";
import * as S from "effect/Schema";
/*
 * Interface for describing an UI schema element that can provide an internationalization base key.
 * If defined, this key is suffixed to derive applicable message keys for the UI schema element.
 * For example, such suffixes are `.label` or `.description` to derive the corresponding message keys for a control element.
 */
export class Internationalizable extends BS.Class<Internationalizable>(`Internationalizable`)(
  {
    i18n: BS.toOptionalWithDefault(S.OptionFromUndefinedOr(S.NonEmptyString))(O.none()),
  },
  [
    {
      schemaId: Symbol.for("@beep/ui/form/ui-schema/Internationalizable"),
      identifier: `Internationalizable`,
      title: "Internationalizable",
      description: "Interface for describing an UI schema element that can provide an internationalization base key.",
      documentation: `Interface for describing an UI schema element that can provide an internationalization base key.
If defined, this key is suffixed to derive applicable message keys for the UI schema element.
For example, such suffixes are \`.label\` or \`.description\` to derive the corresponding message keys for a control element.`,
    },
  ]
) {}

export namespace Internationalizable {
  export type Type = S.Schema.Type<typeof Internationalizable>;
  export type Encoded = S.Schema.Encoded<typeof Internationalizable>;
}
