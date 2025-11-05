import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
export const LogFormatKit = BS.stringLiteralKit("pretty", "json", "logFmt", "structured");

export class LogFormat extends LogFormatKit.Schema.annotations({
  schemaId: Symbol.for("@beep/constants/LogFormat"),
  identifier: "LogFormat",
  title: "Log Format",
  description: "Log format.",
}) {
  static readonly Options = LogFormatKit.Options;
  static readonly Enum = LogFormatKit.Enum;
}

export declare namespace LogFormat {
  export type Type = S.Schema.Type<typeof LogFormat>;
  export type Encoded = S.Schema.Type<typeof LogFormat>;
}

export const LogFormatTaggedKit = LogFormatKit.toTagged("_tag");

export class LogFormatTagged extends LogFormatTaggedKit.Union.annotations({
  schemaId: Symbol.for("@beep/constants/LogFormatTagged"),
  identifier: "LogFormatTagged",
  title: "Log Format Tagged",
  description: "Log format tagged.",
}) {}

export declare namespace LogFormatTagged {
  export type Type = S.Schema.Type<typeof LogFormatTagged>;
  export type Encoded = S.Schema.Type<typeof LogFormatTagged>;
}
