import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

export const NavColorKit = BS.stringLiteralKit("default", "vibrant");

export class NavColor extends NavColorKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/NavColor"),
  identifier: "NavColor",
  title: "Nav Color",
  description: "The users navigation color.",
}) {
  static readonly Options = NavColorKit.Options;
  static readonly Enum = NavColorKit.Enum;
}

export declare namespace NavColor {
  export type Type = S.Schema.Type<typeof NavColor>;
  export type Encoded = S.Schema.Encoded<typeof NavColor>;
}
