import { BS } from "@beep/schema";
import type * as S from "effect/Schema";


export class LogFormat extends BS.StringLiteralKit("pretty", "json", "logFmt", "structured").annotations({
  schemaId: Symbol.for("@beep/constants/LogFormat"),
  identifier: "LogFormat",
  title: "Log Format",
  description: "Log format.",
}) {
}

export declare namespace LogFormat {
  export type Type = S.Schema.Type<typeof LogFormat>;
  export type Encoded = S.Schema.Type<typeof LogFormat>;
}

export class LogFormatTagged extends LogFormat.toTagged("_tag").Union.annotations({
  schemaId: Symbol.for("@beep/constants/LogFormatTagged"),
  identifier: "LogFormatTagged",
  title: "Log Format Tagged",
  description: "Log format tagged.",
}) {}

export declare namespace LogFormatTagged {
  export type Type = S.Schema.Type<typeof LogFormatTagged>;
  export type Encoded = S.Schema.Type<typeof LogFormatTagged>;
}
