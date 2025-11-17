import { stringLiteralKit } from "@beep/schema/kits";
import type * as S from "effect/Schema";
import { CustomId } from "../_id";
import { ALL_LOCALES } from "./ALL_LOCALES.generated";
export const LocaleKit = stringLiteralKit(...ALL_LOCALES);

export class Locale extends LocaleKit.Schema.annotations(
  CustomId.annotations("Locale", {
    description: "Represents a locale",
  })
) {
  static readonly Options = LocaleKit.Options;
  static readonly Enum = LocaleKit.Enum;
}

export declare namespace Locale {
  export type Type = S.Schema.Type<typeof Locale>;
  export type Encoded = S.Schema.Encoded<typeof Locale>;
}
