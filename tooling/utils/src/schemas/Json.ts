import type { JsonLiteralType } from "@beep/tooling-utils/schemas/JsonLiteral";
import { JsonLiteral } from "@beep/tooling-utils/schemas/JsonLiteral";
import * as S from "effect/Schema";

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

export const Json = S.suspend(
  (): S.Schema<JsonType> => S.Union(JsonLiteral, S.Array(Json), S.Record({ key: S.String, value: Json }))
);

export type JsonType = JsonLiteralType | Array<JsonType> | ReadonlyArray<JsonType> | { [key: string]: JsonType };
