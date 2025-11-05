import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

export const LogLevelKit = BS.stringLiteralKit("All", "Debug", "Error", "Fatal", "Info", "Trace", "None", "Warning");

export class LogLevel extends LogLevelKit.Schema.annotations({
  schemaId: Symbol.for("@beep/constants/LogLevel"),
  identifier: "LogLevel",
  title: "Log Level",
  description: "Log level.",
}) {
  static readonly Options = LogLevelKit.Options;
  static readonly Enum = LogLevelKit.Enum;
}

export declare namespace LogLevel {
  export type Type = S.Schema.Type<typeof LogLevel>;
  export type Encoded = S.Schema.Type<typeof LogLevel>;
}
