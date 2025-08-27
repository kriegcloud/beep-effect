import type { UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";
import { Group } from "./Group";
import { createRunner, prepare } from "./prepare";
import type { RootOrGroup } from "./types";

/**
 * Run the rules engine against a value.
 * @export
 * @param {RootOrRuleGroup} group
 * @param {*} value
 * @return {*}  {boolean}
 */
export function run(group: RootOrGroup, value: UnsafeTypes.UnsafeAny): boolean {
  // Root groups: reuse prepare() for validation, normalization, and cached runner.
  if (group.node === "root") {
    const runner = prepare(group);
    return runner(value);
  }

  // Nested groups: validate once per call, then compile and run.
  const validated = S.decodeSync(Group)(S.encodeSync(Group)(group));
  const runner = createRunner(validated);
  return runner(value);
}
