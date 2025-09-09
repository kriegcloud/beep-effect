import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
export const LogFormatKit = BS.stringLiteralKit("pretty", "json", "logFmt", "structured");

export class LogFormat extends LogFormatKit.Schema.annotations({
  schemaId: Symbol.for("@beep/env/common/LogFormat"),
  identifier: "LogFormat",
  title: "Log Format",
  description: "Log format.",
}) {
  static readonly Options = LogFormatKit.Options;
  static readonly Enum = LogFormatKit.Enum;
}

export namespace LogFormat {
  export type Type = S.Schema.Type<typeof LogFormat>;
  export type Encoded = S.Schema.Type<typeof LogFormat>;
}
