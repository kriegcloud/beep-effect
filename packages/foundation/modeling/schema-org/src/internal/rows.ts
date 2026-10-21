import * as MutableHashMap from "effect/MutableHashMap";
import * as Str from "effect/String";

/**
 * Decodes one comma-joined index row.
 *
 * **Details**
 *
 * An empty row is an empty list, not a `[NaN]`.
 *
 * **Example** (Decode populated and empty index rows)
 *
 * ```ts
 * import { decodeRow } from "@beep/schema-org/internal/rows"
 *
 * console.log(JSON.stringify(decodeRow("1,2,3"))) // [1,2,3]
 * console.log(JSON.stringify(decodeRow(""))) // []
 * console.log(JSON.stringify(decodeRow(undefined))) // []
 * ```
 *
 * @internal
 * @category decoding
 * @since 0.0.0
 */
export function decodeRow(row: string | undefined): readonly number[] {
  if (row === undefined || row === "") return [];
  const out: number[] = [];
  for (const part of Str.split(row, ",")) out.push(Number(part));
  return out;
}

/**
 * Decodes a superseded-pair table into `index → supersedingIndex`.
 *
 * **Details**
 *
 * A row missing either index is skipped rather than mapped to `undefined`, so
 * a truncated regeneration drops the pair instead of corrupting the lookup.
 *
 * **Example** (Decode supersession pairs)
 *
 * ```ts
 * import { decodePairs } from "@beep/schema-org/internal/rows"
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = decodePairs(["150,793", "211", ""])
 * console.log(MutableHashMap.size(map)) // 1
 * ```
 *
 * @internal
 * @category decoding
 * @since 0.0.0
 */
export function decodePairs(rows: readonly string[]): MutableHashMap.MutableHashMap<number, number> {
  const map = MutableHashMap.empty<number, number>();
  for (const row of rows) {
    const [from, to] = decodeRow(row);
    if (from !== undefined && to !== undefined) MutableHashMap.set(map, from, to);
  }
  return map;
}
