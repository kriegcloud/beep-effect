import { $ConstantsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $ConstantsId.create("LogFormat");
export class LogFormat extends BS.StringLiteralKit("pretty", "json", "logFmt", "structured").annotations(
  $I.annotations("LogFormat", {
    description: "Log format.",
  })
) {}

export declare namespace LogFormat {
  export type Type = S.Schema.Type<typeof LogFormat>;
  export type Encoded = S.Schema.Type<typeof LogFormat>;
}

export class LogFormatTagged extends LogFormat.toTagged("_tag").Union.annotations(
  $I.annotations("LogFormatTagged", {
    description: "Log format tagged.",
  })
) {}

export declare namespace LogFormatTagged {
  export type Type = S.Schema.Type<typeof LogFormatTagged>;
  export type Encoded = S.Schema.Type<typeof LogFormatTagged>;
}
