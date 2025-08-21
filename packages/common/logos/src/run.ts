import type { UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";
import { createRunner, prepare } from "./prepare";
import type { AnyUnion } from "./types";
import { Union } from "./union";

/**
 * Run the rules engine against a value.
 * @export
 * @param {AnyUnion} union
 * @param {*} value
 * @return {*}  {boolean}
 */
export function run(union: AnyUnion, value: UnsafeTypes.UnsafeAny): boolean {
  // Root unions: reuse prepare() for validation, normalization, and cached runner.
  if (union.entity === "rootUnion") {
    const runner = prepare(union);
    return runner(value);
  }

  // Nested unions: validate once per call, then compile and run.
  const validated = S.decodeSync(Union)(S.encodeSync(Union)(union));
  const runner = createRunner(validated);
  return runner(value);
}
