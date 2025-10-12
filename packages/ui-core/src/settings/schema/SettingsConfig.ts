import * as S from "effect/Schema";
import { mainDrawerWidth } from "./constants";
import { NavColor } from "./NavColor";
import { NavigationMenuType } from "./NavigationMenuType";
import { SideNavType } from "./SideNavType";
import { SupportedLocale } from "./SupportedLocale";
import { TextDirection } from "./TextDirection";
import { ThemeMode } from "./ThemeMode";
import { TopNavType } from "./TopNavType";

export class SettingsConfig extends S.Struct({
  textDirection: TextDirection,
  themeMode: ThemeMode,
  navigationMenuType: NavigationMenuType,
  sidenavType: SideNavType,
  topnavType: TopNavType,
  navColor: NavColor,
  locale: SupportedLocale,
  sidenavCollapsed: S.Boolean,
  openNavbarDrawer: S.Boolean,
  drawerWidth: S.NonNegativeInt,
}) {
  static readonly initialValue = this.make({
    textDirection: TextDirection.Enum.ltr,
    themeMode: ThemeMode.Enum.system,
    navigationMenuType: NavigationMenuType.Enum.sidenav,
    sidenavType: SideNavType.Enum.default,
    topnavType: TopNavType.Enum.default,
    navColor: NavColor.Enum.default,
    locale: SupportedLocale.Enum["en-US"],
    sidenavCollapsed: false,
    openNavbarDrawer: false,
    drawerWidth: mainDrawerWidth.full,
  });
}

export declare namespace SettingsConfig {
  export type Type = S.Schema.Type<typeof SettingsConfig>;
  export type Encoded = S.Schema.Encoded<typeof SettingsConfig>;
}
