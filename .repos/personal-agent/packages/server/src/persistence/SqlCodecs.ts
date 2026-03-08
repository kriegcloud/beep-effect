import { Option, Schema } from "effect"
import type { DateTime } from "effect"
import * as Transformation from "effect/SchemaTransformation"

type Instant = DateTime.Utc

// ── Instant codecs ──
const InstantFromSqlString = Schema.DateTimeUtcFromString
const _decodeInstant = Schema.decodeUnknownSync(InstantFromSqlString)
const _encodeInstant = Schema.encodeSync(InstantFromSqlString)

/** Decode/encode a required (non-nullable) SQL TEXT column to/from DateTime.Utc */
export const sqlInstant = {
  decode: (value: string): Instant => _decodeInstant(value),
  encode: (instant: Instant): string => _encodeInstant(instant),
} as const

/** Decode/encode a nullable SQL TEXT column to/from DateTime.Utc | null */
export const sqlInstantNullable = {
  decode: (value: string | null): Instant | null =>
    value === null ? null : _decodeInstant(value),
  encode: (instant: Instant | null): string | null =>
    instant === null ? null : _encodeInstant(instant),
} as const

// ── JSON-in-column factory ──

type SyncSchema = Schema.Top & {
  readonly DecodingServices: never
  readonly EncodingServices: never
}

/** Create decode/encode pair for a JSON string stored in a SQLite TEXT column. */
export const sqlJsonColumn = <S extends SyncSchema>(schema: S) => {
  const codec = Schema.fromJsonString(schema)
  return {
    codec,
    decode: Schema.decodeUnknownSync(codec),
    encode: Schema.encodeSync(codec),
  } as const
}

// ── Cursor factory ──
/** Create base64url cursor encode/decode for keyset pagination. */
export const sqlCursor = <S extends SyncSchema & { readonly Type: Record<string, unknown>; readonly Encoded: string }>(
  schema: S
) => ({
  encode: (fields: S["Type"]): string =>
    Buffer.from(Schema.encodeSync(schema)(fields)).toString("base64url"),
  decode: (cursor: string): S["Type"] | null =>
    Option.getOrNull(
      Schema.decodeOption(schema)(
        Buffer.from(cursor, "base64url").toString("utf8")
      )
    ),
})

// ── Row transform re-export ──
export { Transformation }
export const rowTransform = Transformation.transform
