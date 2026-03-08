import type { Option } from "effect"
import { decodeJsonRecordOption, decodeUnknownJsonOrInput } from "./JsonStringCodecs.js"

export const parseJsonRecordOption = (
  value: string
): Option.Option<Record<string, unknown>> =>
  decodeJsonRecordOption(value)

export const safeJsonParseUnknown = (value: string): unknown | string =>
  decodeUnknownJsonOrInput(value)

export const safeJsonStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value)
  } catch {
    return JSON.stringify({ value: String(value) })
  }
}
