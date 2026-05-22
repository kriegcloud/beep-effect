/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import type { TUnsafe } from "@beep/types";
import * as S from "effect/Schema";
import type * as VariantSchema from "../VariantSchema/index.ts";
import { Field } from "./Model.variants.ts";
/**
 * Interface for a field stored as a JSON text column in the database.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * const field = Model.JsonFromString(Schema.Struct({ a: Schema.String }))
 *
 * void field
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export interface JsonFromString<S extends S.Top>
  extends VariantSchema.Field<{
    readonly select: S.fromJsonString<S>;
    readonly insert: S.fromJsonString<S>;
    readonly update: S.fromJsonString<S>;
    readonly json: S;
    readonly jsonCreate: S;
    readonly jsonUpdate: S;
  }> {}

/**
 * A field that represents a JSON value stored as text in the database.
 *
 * The "json" variants will use the object schema directly.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * class Record extends Model.Class<Record>("Record")({}) {}
 *
 * void Record
 * ```
 *
 * @since 0.0.0
 * @category codecs
 */
export const JsonFromString = <S extends S.Top>(schema: S): JsonFromString<S> => {
  const parsed = schema.pipe(S.toCodecJson, S.fromJsonString) as TUnsafe.Any;
  return Field({
    select: parsed,
    insert: parsed,
    update: parsed,
    json: schema,
    jsonCreate: schema,
    jsonUpdate: schema,
  });
};
