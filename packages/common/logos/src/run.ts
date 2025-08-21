import type { UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";
import { createRunner } from "./prepare";
import type { AnyUnion } from "./types";
import { Union } from "./union";
import { validate } from "./validate";

/**
 * Run the rules engine against a value.
 * @export
 * @param {AnyUnion} union
 * @param {*} value
 * @return {*}  {boolean}
 */
export function run(union: AnyUnion, value: UnsafeTypes.UnsafeAny): boolean {
  // Root unions: preserve previous behavior by validating on every call.
  if (union.entity === "rootUnion") {
    const v = validate(union);
    if (!v.isValid) {
      throw new Error(v.reason);
    }
    if (union.rules.length === 0) return true;
    const runner = createRunner(union);
    return runner(value);
  }

  // Nested unions: validate once per call, then compile and run.
  const validated = S.decodeSync(Union)(S.encodeSync(Union)(union));
  const runner = createRunner(validated);
  return runner(value);
}
