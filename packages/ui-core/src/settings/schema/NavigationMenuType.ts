import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
export const NavigationMenuTypeKit = BS.stringLiteralKit("sidenav", "topnav", "combo");

export class NavigationMenuType extends NavigationMenuTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/NavigationMenuType"),
  identifier: "NavigationMenuType",
  title: "Navigation Menu Type",
  description: "The users navigation menu type.",
}) {
  static readonly Options = NavigationMenuTypeKit.Options;
  static readonly Enum = NavigationMenuTypeKit.Enum;
}

export declare namespace NavigationMenuType {
  export type Type = S.Schema.Type<typeof NavigationMenuType>;
  export type Encoded = S.Schema.Encoded<typeof NavigationMenuType>;
}
