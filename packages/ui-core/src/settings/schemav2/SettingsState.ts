import {BS} from "@beep/schema";
import {themeConfig} from "@beep/ui-core/theme/theme-config";
import * as S from "effect/Schema";
import * as F from "effect/Function";
import {StructUtils} from "@beep/utils";
import {Atom} from "@effect-atom/atom-react";
import {BrowserKeyValueStore} from "@effect/platform-browser";

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

export const SettingsUpdateValue = S.partial(SettingsState).annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/schema/SettingsUpdateValue"),
  identifier: "SettingsUpdateValue",
  title: "Settings Update Value",
  description: "A value representing the update value of the settings",
});

export declare namespace SettingsUpdateValue {
  export type Type = typeof SettingsUpdateValue.Type;
  export type Encoded = typeof SettingsUpdateValue.Encoded;
}

export const SettingsFieldNameKit = BS.stringLiteralKit(
  ...StructUtils.structKeys(SettingsState.fields)
);


export class SettingsFieldName extends SettingsFieldNameKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/schema/SettingsFieldName"),
  identifier: "SettingsFieldName",
  title: "Settings Field Name",
  description: "A value representing the name of the field of the settings",
}) {
  static readonly Options = SettingsFieldNameKit.Options;
  static readonly Enum = SettingsFieldNameKit.Enum;
}

export declare namespace SettingsFieldName {
  export type Type = typeof SettingsFieldName.Type;
  export type Encoded = typeof SettingsFieldName.Encoded;
}


export const SetFieldInput = F.pipe(
  SettingsFieldNameKit.toTagged("name"),
  ({Members}) => S.Union(
    S.Struct({
      name: Members.compactLayout,
      value: SettingsState.fields.compactLayout,
    }),
    S.Struct({
      name: Members.contrast,
      value: SettingsState.fields.contrast,
    }),
    S.Struct({
      name: Members.direction,
      value: SettingsState.fields.direction,
    }),
    S.Struct({
      name: Members.navColor,
      value: SettingsState.fields.navColor,
    }),
    S.Struct({
      name: Members.navLayout,
      value: SettingsState.fields.navLayout,
    }),
    S.Struct({
      name: Members.mode,
      value: SettingsState.fields.mode,
    }),
    S.Struct({
      name: Members.primaryColor,
      value: SettingsState.fields.primaryColor,
    }),
    S.Struct({
      name: Members.fontSize,
      value: SettingsState.fields.fontSize,
    }),
    S.Struct({
      name: Members.fontFamily,
      value: SettingsState.fields.fontFamily,
    }),
    S.Struct({
      name: Members.version,
      value: SettingsState.fields.version,
    }),
  )
);

export declare namespace SetFieldInput {
  export type Type = typeof SetFieldInput.Type;
  export type Encoded = typeof SetFieldInput.Encoded;
}

export class SettingsContext extends BS.Class<SettingsContext>("SettingsContext")({
  state: SettingsState,
  isDarkMode: S.Boolean,
  canReset: S.Boolean,
  onReset: BS.NoInputVoidFn.Schema,
  setState: new BS.Fn({
    input: SettingsUpdateValue,
    output: S.Void,
  }).Schema,
  setField: new BS.Fn({
    input: SetFieldInput,
    output: S.Void,
  }).Schema,
  openDrawer: S.Boolean,
  onCloseDrawer: BS.NoInputVoidFn.Schema,
  onToggleDrawer: BS.NoInputVoidFn.Schema,
}) {
}

export declare namespace SettingsContext {
  export type Type = typeof SettingsContext.Type;
  export type Encoded = typeof SettingsContext.Encoded;
}


export const settingsAtom = Atom.kvs({
  runtime: Atom.runtime(BrowserKeyValueStore.layerLocalStorage),
  key: "settings",
  schema: SettingsState,
  defaultValue: () => SettingsState.defaultSettings,
});