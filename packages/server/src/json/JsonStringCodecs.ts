import { Option, Schema } from "effect"

export const UnknownJsonStringSchema = Schema.UnknownFromJsonString

export const encodeUnknownJsonEffect = Schema.encodeUnknownEffect(UnknownJsonStringSchema)
export const encodeUnknownJsonSync = Schema.encodeUnknownSync(UnknownJsonStringSchema)

export const decodeUnknownJsonOption = Schema.decodeUnknownOption(UnknownJsonStringSchema)
export const decodeUnknownJsonEffect = Schema.decodeUnknownEffect(UnknownJsonStringSchema)
export const decodeJsonStringOption = <A>(schema: Schema.Schema<A>) => {
  const decode = Schema.decodeUnknownOption(
    schema as never
  ) as (value: unknown) => Option.Option<A>
  return (value: string): Option.Option<A> => {
    try {
      return decode(JSON.parse(value))
    } catch {
      return Option.none()
    }
  }
}

const isJsonRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

export const decodeJsonRecordOption = (
  value: string
): Option.Option<Record<string, unknown>> => {
  const parsed = Option.getOrNull(decodeUnknownJsonOption(value))
  return isJsonRecord(parsed)
    ? Option.some(parsed)
    : Option.none()
}

export const decodeUnknownJsonOrInput = (value: string): unknown | string =>
  Option.getOrElse(decodeUnknownJsonOption(value), () => value)
