import { $SchemaId } from "@beep/identity";
import { LiteralKit } from "./LiteralKit.ts";

const $I = $SchemaId.create("Logs");

export const LogLevel = LiteralKit(["All", "Fatal", "Error", "Warn", "Info", "Debug", "Trace", "None"]).annotate(
  $I.annote("LogLevel", {
    description: "Log levels supported",
  })
);

export type LogLevel = typeof LogLevel.Type;

export const LogSeverity = LiteralKit(["Fatal", "Error", "Warn", "Info", "Debug", "Trace"]).annotate(
  $I.annote("LogSeverity", {
    description: "Log severities supported",
  })
);

export type LogSeverity = typeof LogSeverity.Type;
