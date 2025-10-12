import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
export const TextDirectionKit = BS.stringLiteralKit("rtl", "ltr");

export class TextDirection extends TextDirectionKit.Schema.annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/TextDirection"),
  identifier: "TextDirection",
  title: "Text Direction",
  description: "The users text direction.",
}) {
  static readonly Options = TextDirectionKit.Options;
  static readonly Enum = TextDirectionKit.Enum;
}

export declare namespace TextDirection {
  export type Type = S.Schema.Type<typeof TextDirection>;
  export type Encoded = S.Schema.Encoded<typeof TextDirection>;
}
