import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

export class LogLevel extends BS.StringLiteralKit("All", "Debug", "Error", "Fatal", "Info", "Trace", "None", "Warning").annotations({
  schemaId: Symbol.for("@beep/constants/LogLevel"),
  identifier: "LogLevel",
  title: "Log Level",
  description: "Log level.",
}) {
}

export declare namespace LogLevel {
  export type Type = S.Schema.Type<typeof LogLevel>;
  export type Encoded = S.Schema.Type<typeof LogLevel>;
}
