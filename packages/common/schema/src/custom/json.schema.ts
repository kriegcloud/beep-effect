import { sid } from "@beep/schema/id";
import * as S from "effect/Schema";

/**
 * JSON literal values (primitives accepted by JSON).
 *
 * @since 0.1.0
 * @category JSON
 */
export namespace JsonLiteral {
  /** `string | number | boolean | null` */
  export const Schema = S.Union(S.String, S.Number, S.Boolean, S.Null);
  export type Type = typeof Schema.Type;
}

/**
 * General JSON structure (recursive).
 *
 * Equivalent to:
 * ```ts
 * type Json =
 *   | string | number | boolean | null
 *   | { [key: string]: Json }
 *   | Json[] | ReadonlyArray<Json>;
 * ```
 *
 * Implementation notes:
 * - Uses `S.suspend` to break the recursive cycle.
 * - Uses `S.Record({ key: S.String, value: Schema })` to model objects.
 *
 * ## Example
 * ```ts
 * const decode = S.decodeUnknown(Json.Schema);
 * const ok = decode({ a: [1, "x", null], b: { c: true } });
 * const bad = decode({ toJSON: () => 1 } as any); // functions are not JSON
 * ```
 *
 * @since 0.1.0
 * @category JSON
 */
export namespace Json {
  export type Type =
    | string
    | number
    | boolean
    | { [key: string]: Type }
    | Type[]
    | ReadonlyArray<Type>
    | null;

  export const Schema = S.suspend(
    (): S.Schema<Type> =>
      S.Union(
        JsonLiteral.Schema,
        S.Array(Schema),
        S.Record({ key: S.String, value: Schema }),
      ),
  ).annotations({
    identifier: sid.common.schema("Json"),
    title: "Json",
    description: "A Valid JSON",
  });
}
