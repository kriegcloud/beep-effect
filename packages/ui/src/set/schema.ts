import { BS } from "@beep/schema";
import * as Match from "effect/Match";
import * as S from "effect/Schema";

export const ThemeModeKit = BS.stringLiteralKit("light", "dark", "system");

export class ThemeMode extends ThemeModeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui/settings/ThemeMode"),
  identifier: "ThemeMode",
  title: "Theme Mode",
  description: "The users theme.",
  default: ThemeModeKit.Enum.system,
}) {
  static readonly Options = ThemeModeKit.Options;
  static readonly Enum = ThemeModeKit.Enum;
}

export declare namespace ThemeMode {
  export type Type = typeof ThemeMode.Type;
  export type Encoded = typeof ThemeMode.Encoded;
}

export const NavigationMenuTypeKit = BS.stringLiteralKit("sidenav", "topnav", "combo");

export class NavigationMenuType extends NavigationMenuTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui/settings/NavigationMenuType"),
  identifier: "NavigationMenuType",
  title: "Navigation Menu Type",
  description: "The users navigation menu type.",
  default: NavigationMenuTypeKit.Enum.combo,
}) {
  static readonly Options = NavigationMenuTypeKit.Options;
  static readonly Enum = NavigationMenuTypeKit.Enum;
}

export declare namespace NavigationMenuType {
  export type Type = typeof NavigationMenuType.Type;
  export type Encoded = typeof NavigationMenuType.Encoded;
}

export const SideNavTypeKit = BS.stringLiteralKit("default", "stacked", "slim");

export class SideNavType extends SideNavTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui/settings/SideNavType"),
  identifier: "SideNavType",
  title: "SideNav Type",
  description: "The users side navigation type.",
  default: SideNavTypeKit.Enum.default,
}) {
  static readonly Options = SideNavTypeKit.Options;
  static readonly Enum = SideNavTypeKit.Enum;
}

export declare namespace SideNavType {
  export type Type = typeof SideNavType.Type;
  export type Encoded = typeof SideNavType.Encoded;
}

export const TopNavTypeKit = BS.stringLiteralKit("default", "stacked", "slim");

export class TopNavType extends TopNavTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui/settings/TopNavType"),
  identifier: "TopNavType",
  title: "TopNav Type",
  description: "The users top navigation type.",
  default: TopNavTypeKit.Enum.default,
}) {
  static readonly Options = TopNavTypeKit.Options;
  static readonly Enum = TopNavTypeKit.Enum;
}

export declare namespace TopNavType {
  export type Type = typeof TopNavType.Type;
  export type Encoded = typeof TopNavType.Encoded;
}

export const TextDirectionKit = BS.stringLiteralKit("rtl", "ltr");

export class TextDirection extends TextDirectionKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui/settings/TextDirection"),
  identifier: "TextDirection",
  title: "Text Direction",
  description: "The users text direction.",
  default: TextDirectionKit.Enum.ltr,
}) {
  static readonly Options = TextDirectionKit.Options;
  static readonly Enum = TextDirectionKit.Enum;
}

export declare namespace TextDirection {
  export type Type = typeof TextDirection.Type;
  export type Encoded = typeof TextDirection.Encoded;
}

export const NavColorKit = BS.stringLiteralKit("default", "vibrant");

export class NavColor extends NavColorKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui/settings/NavColor"),
  identifier: "NavColor",
  title: "Nav Color",
  description: "The users navigation color.",
  default: NavColorKit.Enum.default,
}) {
  static readonly Options = NavColorKit.Options;
  static readonly Enum = NavColorKit.Enum;
}

export declare namespace NavColor {
  export type Type = typeof NavColor.Type;
  export type Encoded = typeof NavColor.Encoded;
}

export const SupportedLocaleKit = BS.stringLiteralKit("en-US", "fs-FR", "bn-BD", "zh-CN", "hi-IN", "ar-SA");

export class SupportedLocale extends SupportedLocaleKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui/settings/SupportedLocale"),
  identifier: "SupportedLocale",
  title: "Supported Locale",
  description: "The users supported locale.",
  default: SupportedLocaleKit.Enum["en-US"],
}) {
  static readonly Options = SupportedLocaleKit.Options;
  static readonly Enum = SupportedLocaleKit.Enum;
}

export declare namespace SupportedLocale {
  export type Type = typeof SupportedLocale.Type;
  export type Encoded = typeof SupportedLocale.Encoded;
}

export class SettingsConfig extends BS.Class<SettingsConfig>("@beep/ui/settings/SettingsConfig")(
  {
    textDirection: TextDirection,
    themeMode: ThemeMode,
    navigationMenuType: NavigationMenuType,
    sideNavType: SideNavType,
    topNavType: TopNavType,
    navColor: NavColor,
    supportedLocale: SupportedLocale,
  },
  [
    {
      schemaId: Symbol.for("@beep/ui/settings/SettingsConfig"),
      identifier: "SettingsConfig",
      title: "SettingsConfig",
      description: "The users config.",
    },
    { undefined },
    {
      default: {
        textDirection: TextDirectionKit.Enum.ltr,
        themeMode: ThemeModeKit.Enum.system,
        navigationMenuType: NavigationMenuTypeKit.Enum.combo,
        sideNavType: SideNavTypeKit.Enum.default,
        topNavType: TopNavTypeKit.Enum.default,
        navColor: NavColorKit.Enum.default,
        supportedLocale: SupportedLocaleKit.Enum["en-US"],
      },
    },
  ]
) {}

export declare namespace SettingsConfig {
  export type Type = S.Schema.Type<SettingsConfig>;
  export type Encoded = S.Schema.Encoded<SettingsConfig>;
}

export const SettingsActionTypeKit = BS.stringLiteralKit(
  "SET_CONFIG",
  "REFRESH",
  "RESET",
  "COLLAPSE_NAVBAR",
  "EXPAND_NAVBAR",
  "SET_SIDENAV_SHAPE",
  "SET_NAVIGATION_MENU_TYPE",
  "SET_NAV_COLOR",
  "SET_LOCALE"
);

const { Members } = SettingsActionTypeKit.toTagged("type");

export class SettingsActionTagged extends S.Union(
  S.Struct(
    BS.mergeFields(Members.SET_CONFIG.fields, {
      payload: S.Struct({ beep: S.String }),
    })
  ),
  S.Struct(Members.REFRESH.fields),
  S.Struct(Members.RESET.fields),
  S.Struct(Members.COLLAPSE_NAVBAR.fields),
  S.Struct(Members.EXPAND_NAVBAR.fields),
  S.Struct(Members.SET_SIDENAV_SHAPE.fields),
  S.Struct(Members.SET_NAVIGATION_MENU_TYPE.fields),
  S.Struct(Members.SET_NAV_COLOR.fields),
  S.Struct(Members.SET_LOCALE.fields)
) {}

export class SettingsActionType extends SettingsActionTagged.annotations({
  schemaId: Symbol.for("@beep/ui/settings/SettingsActionType"),
  identifier: "SettingsActionType",
  title: "SettingsActionType",
  description: "The users settings action type.",
}) {
  static readonly reduce = Match.type<SettingsActionType.Type>().pipe(
    Match.discriminatorsExhaustive("type")({
      SET_CONFIG: (action) => action,
      REFRESH: (action) => action,
      RESET: (action) => action,
      COLLAPSE_NAVBAR: (action) => action,
      EXPAND_NAVBAR: (action) => action,
      SET_SIDENAV_SHAPE: (action) => action,
      SET_NAVIGATION_MENU_TYPE: (action) => action,
      SET_NAV_COLOR: (action) => action,
      SET_LOCALE: (action) => action,
    })
  );
}

export declare namespace SettingsActionType {
  export type Type = typeof SettingsActionType.Type;
  export type Encoded = typeof SettingsActionType.Encoded;
}
