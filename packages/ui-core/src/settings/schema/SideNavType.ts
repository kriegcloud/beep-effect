import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

export const SideNavTypeKit = BS.stringLiteralKit("default", "stacked", "slim");

export class SideNavType extends SideNavTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/SideNavType"),
  identifier: "SideNavType",
  title: "SideNav Type",
  description: "The users side navigation type.",
}) {
  static readonly Options = SideNavTypeKit.Options;
  static readonly Enum = SideNavTypeKit.Enum;
}

export declare namespace SideNavType {
  export type Type = S.Schema.Type<typeof SideNavType>;
  export type Encoded = S.Schema.Encoded<typeof SideNavType>;
}
