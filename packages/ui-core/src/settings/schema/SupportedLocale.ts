import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
export const SupportedLocaleKit = BS.stringLiteralKit("en-US", "fr-FR", "bn-BD", "zh-CN", "hi-IN", "ar-SA");

export class SupportedLocale extends SupportedLocaleKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/SupportedLocale"),
  identifier: "SupportedLocale",
  title: "Supported Locale",
  description: "The users supported locale.",
}) {
  static readonly Options = SupportedLocaleKit.Options;
  static readonly Enum = SupportedLocaleKit.Enum;
}

export declare namespace SupportedLocale {
  export type Type = S.Schema.Type<typeof SupportedLocale>;
  export type Encoded = S.Schema.Encoded<typeof SupportedLocale>;
}
