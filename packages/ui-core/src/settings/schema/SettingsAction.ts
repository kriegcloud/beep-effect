import { BS } from "@beep/schema";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as S from "effect/Schema";
import { mainDrawerWidth } from "./constants";
import { NavColor } from "./NavColor";
import { NavigationMenuType } from "./NavigationMenuType";
import { SettingsConfig } from "./SettingsConfig";
import { SideNavType } from "./SideNavType";
import { SupportedLocale } from "./SupportedLocale";

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

export class SettingsAction extends S.Union(
  S.Struct(
    BS.mergeFields(Members.SET_CONFIG.fields, {
      payload: S.partial(SettingsConfig),
    })
  ),
  S.Struct(Members.REFRESH.fields),
  S.Struct(Members.RESET.fields),
  S.Struct(Members.COLLAPSE_NAVBAR.fields),
  S.Struct(Members.EXPAND_NAVBAR.fields),
  S.Struct(
    BS.mergeFields(Members.SET_SIDENAV_SHAPE.fields, {
      payload: SideNavType,
    })
  ),
  S.Struct(
    BS.mergeFields(Members.SET_NAVIGATION_MENU_TYPE.fields, {
      payload: NavigationMenuType,
    })
  ),
  S.Struct(
    BS.mergeFields(Members.SET_NAV_COLOR.fields, {
      payload: NavColor,
    })
  ),
  S.Struct(
    BS.mergeFields(Members.SET_LOCALE.fields, {
      payload: SupportedLocale,
    })
  )
).annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/SettingsAction"),
  identifier: "SettingsAction",
  title: "SettingsAction",
  description: "A possible action that can be taken on the settings.",
}) {
  static readonly reduceAndApply = Effect.fn("SettingsAction.reduceAndApply")(function* (
    state: SettingsConfig.Type,
    action: SettingsAction.Type
  ) {
    // const localStorage = yield* KeyValueStore.KeyValueStore;

    return F.pipe(
      action,
      Match.type<SettingsAction.Type>().pipe(
        Match.discriminatorsExhaustive("type")({
          SET_CONFIG: (action) => action.payload,
          REFRESH: () => state,
          RESET: () => SettingsConfig.initialValue,
          COLLAPSE_NAVBAR: () => ({
            ...state,
            sidenavCollapsed: true,
            drawerWidth:
              state.sideNavType === "stacked" ? mainDrawerWidth.stackedNavCollapsed : mainDrawerWidth.collapsed,
          }),
          EXPAND_NAVBAR: () => ({
            ...state,
            sidenavCollapsed: false,
            drawerWidth: mainDrawerWidth.full,
          }),
          SET_SIDENAV_SHAPE: (action) =>
            Match.value(action.payload).pipe(
              Match.when("default", (payload) => ({
                ...state,
                sideNavType: payload,
                sidenavCollapsed: false,
                drawerWidth: mainDrawerWidth.full,
              })),
              Match.when("slim", (payload) => ({
                ...state,
                sideNavType: payload,
                sidenavCollapsed: false,
                drawerWidth: mainDrawerWidth.slim,
              })),
              Match.when("stacked", (payload) => ({
                ...state,
                sideNavType: payload,
                sidenavCollapsed: false,
                drawerWidth: mainDrawerWidth.full,
              }))
            ),
          SET_NAVIGATION_MENU_TYPE: (action) =>
            Match.value(action.payload).pipe(
              Match.when("sidenav", (payload) => ({
                ...state,
                navigationMenuType: payload,
                drawerWidth: mainDrawerWidth.full,
              })),
              Match.when("topnav", (payload) => ({
                ...state,
                navigationMenuType: payload,
                sidenavCollapsed: false,
                drawerWidth: mainDrawerWidth.full,
              })),
              Match.when("combo", (payload) => ({
                ...state,
                navigationMenuType: payload,
                sidenavCollapsed: false,
                drawerWidth: mainDrawerWidth.full,
              })),
              Match.exhaustive
            ),
          SET_NAV_COLOR: (action) => ({
            ...state,
            navColor: action.payload,
          }),
          SET_LOCALE: (action) => ({
            ...state,
            locale: action.payload,
            textDirection: action.payload === "ar-SA" ? "rtl" : "ltr",
          }),
        })
      )
    );
  });
}

export declare namespace SettingsAction {
  export type Type = S.Schema.Type<typeof SettingsAction>;
  export type Encoded = S.Schema.Encoded<typeof SettingsAction>;
}
