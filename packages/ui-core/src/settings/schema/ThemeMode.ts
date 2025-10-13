import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export const ThemeModeKit = BS.stringLiteralKit("light", "dark", "system");

export class ThemeMode extends ThemeModeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/ThemeMode"),
  identifier: "ThemeMode",
  title: "Theme Mode",
  description: "The users theme.",
}) {
  static readonly Options = ThemeModeKit.Options;
  static readonly Enum = ThemeModeKit.Enum;
  static readonly make = S.decodeUnknownSync(ThemeMode);
}

export declare namespace ThemeMode {
  export type Type = S.Schema.Type<typeof ThemeMode>;
  export type Encoded = S.Schema.Encoded<typeof ThemeMode>;
}
