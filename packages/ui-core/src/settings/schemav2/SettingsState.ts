import { BS } from "@beep/schema";
import { themeConfig } from "@beep/ui-core/theme/theme-config";
import * as S from "effect/Schema";
export const SettingsContrastKit = BS.stringLiteralKit("default", "high");
export class SettingsContrast extends SettingsContrastKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/schema/SettingsContrast"),
  identifier: "SettingsContrast",
  title: "Settings Contrast",
  description: "A value representing the contrast setting of the ui",
}) {
  static readonly Options = SettingsContrastKit.Options;
  static readonly Enum = SettingsContrastKit.Enum;
}

export declare namespace SettingsContrast {
  export type Type = typeof SettingsContrast.Type;
  export type Encoded = typeof SettingsContrast.Encoded;
}

export const SettingsPrimaryColorKit = BS.stringLiteralKit(
  "default",
  "preset1",
  "preset2",
  "preset3",
  "preset4",
  "preset5"
);

export class SettingsPrimaryColor extends SettingsPrimaryColorKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/schema/SettingsPrimaryColor"),
  identifier: "SettingsPrimaryColor",
  title: "Settings Primary Color",
  description: "A value representing the primary color setting of the ui",
}) {
  static readonly Options = SettingsPrimaryColorKit.Options;
  static readonly Enum = SettingsPrimaryColorKit.Enum;
}

export declare namespace SettingsPrimaryColor {
  export type Type = typeof SettingsPrimaryColor.Type;
  export type Encoded = typeof SettingsPrimaryColor.Encoded;
}

export const SettingsModeKit = BS.stringLiteralKit("light", "dark", "system");

export class SettingsMode extends SettingsModeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/schema/SettingsMode"),
  identifier: "SettingsMode",
  title: "Settings Mode",
  description: "A value representing the mode setting of the ui",
}) {
  static readonly Options = SettingsModeKit.Options;
  static readonly Enum = SettingsModeKit.Enum;
}

export declare namespace SettingsMode {
  export type Type = typeof SettingsMode.Type;
  export type Encoded = typeof SettingsMode.Encoded;
}

export const SettingsDirectionKit = BS.stringLiteralKit("ltr", "rtl");

export class SettingsDirection extends SettingsDirectionKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/schema/SettingsDirection"),
  identifier: "SettingsDirection",
  title: "Settings Direction",
  description: "A value representing the direction setting of the ui",
}) {
  static readonly Options = SettingsDirectionKit.Options;
  static readonly Enum = SettingsDirectionKit.Enum;
}

export declare namespace SettingsDirection {
  export type Type = typeof SettingsDirection.Type;
  export type Encoded = typeof SettingsDirection.Encoded;
}

export const SettingsNavLayoutKit = BS.stringLiteralKit("vertical", "horizontal", "mini");

export class SettingsNavLayout extends SettingsNavLayoutKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/schema/SettingsNavLayout"),
  identifier: "SettingsNavLayout",
  title: "Settings Nav Layout",
  description: "A value representing the nav layout setting of the ui",
}) {
  static readonly Options = SettingsNavLayoutKit.Options;
  static readonly Enum = SettingsNavLayoutKit.Enum;
}

export declare namespace SettingsNavLayout {
  export type Type = typeof SettingsNavLayout.Type;
  export type Encoded = typeof SettingsNavLayout.Encoded;
}

export const NavColorKit = BS.stringLiteralKit("integrate", "apparent");

export class NavColor extends NavColorKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/schema/NavColor"),
  identifier: "NavColor",
  title: "Nav Color",
  description: "A value representing the nav color setting of the ui",
}) {
  static readonly Options = NavColorKit.Options;
  static readonly Enum = NavColorKit.Enum;
}

export declare namespace NavColor {
  export type Type = typeof NavColor.Type;
  export type Encoded = typeof NavColor.Encoded;
}

export class SettingsState extends BS.Class<SettingsState>("SettingsState")({
  version: BS.SemanticVersion,
  fontSize: S.Number,
  fontFamily: S.String,
  compactLayout: S.Boolean,
  contrast: SettingsContrast,
  primaryColor: SettingsPrimaryColor,
  mode: SettingsMode,
  navColor: NavColor,
  direction: SettingsDirection,
  navLayout: SettingsNavLayout,
}) {
  static readonly defaultSettings = SettingsState.make({
    version: BS.SemanticVersion.make("1.0.0"),
    fontSize: 16,
    fontFamily: themeConfig.fontFamily.primary,
    compactLayout: true,
    contrast: SettingsContrast.Enum.default,
    navLayout: SettingsNavLayout.Enum.vertical,
    navColor: NavColor.Enum.integrate,
    mode: SettingsMode.Enum.light,
    direction: SettingsDirection.Enum.ltr,
    primaryColor: SettingsPrimaryColor.Enum.default,
  });
}

export declare namespace SettingsState {
  export type Type = typeof SettingsState.Type;
  export type Encoded = typeof SettingsState.Encoded;
}
