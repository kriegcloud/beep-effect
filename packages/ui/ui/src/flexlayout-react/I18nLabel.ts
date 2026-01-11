import { $UiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $UiId.create("flex-layout/i18n-label");

export class I18nLabel extends BS.MappedLiteralKit(
  ["Close_Tab", "Close"],
  ["Close_Tabset", "Close tab set"],
  ["Active_Tabset", "Active tab set"],
  ["Move_Tabset", "Move tab set"],
  ["Move_Tabs", "Move tabs(?)"],
  ["Maximize", "Maximize tab set"],
  ["Restore", "Restore tab set"],
  ["Popout_Tab", "Popout selected tab"],
  ["Overflow_Menu_Tooltip", "Hidden tabs"],
  ["Error_rendering_component", "Error rendering component"],
  ["Error_rendering_component_retry", "Retry"]
).annotations(
  $I.annotations("I18nLabel", {
    description:
      "Internationalization labels used throughout the flex-layout system.\nUsing `as const` for TypeScript erasable syntax compatibility.",
  })
) {}

export declare namespace I18nLabel {
  export type Type = typeof I18nLabel.Type;
  export type Encoded = typeof I18nLabel.Encoded;
}
