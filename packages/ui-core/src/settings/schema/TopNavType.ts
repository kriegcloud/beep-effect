import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

export const TopNavTypeKit = BS.stringLiteralKit("default", "stacked", "slim");

export class TopNavType extends TopNavTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/TopNavType"),
  identifier: "TopNavType",
  title: "TopNav Type",
  description: "The users top navigation type.",
}) {
  static readonly Options = TopNavTypeKit.Options;
  static readonly Enum = TopNavTypeKit.Enum;
}

export declare namespace TopNavType {
  export type Type = S.Schema.Type<typeof TopNavType>;
  export type Encoded = S.Schema.Encoded<typeof TopNavType>;
}
