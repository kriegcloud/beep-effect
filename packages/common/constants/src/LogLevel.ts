import { $ConstantsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $ConstantsId.create("LogFormat");
export class LogLevel extends BS.StringLiteralKit(
  "All",
  "Debug",
  "Error",
  "Fatal",
  "Info",
  "Trace",
  "None",
  "Warning"
).annotations(
  $I.annotations("LogLevel", {
    description: "Log level.",
  })
) {}

export declare namespace LogLevel {
  export type Type = S.Schema.Type<typeof LogLevel>;
  export type Encoded = S.Schema.Type<typeof LogLevel>;
}
