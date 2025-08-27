import type { UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";
import { createRunner, prepare } from "./prepare";
import { RuleGroup } from "./RuleGroup";
import type { RuleSetOrGroup } from "./types";

/**
 * Run the rules engine against a value.
 * @export
 * @param {RootOrRuleGroup} group
 * @param {*} value
 * @return {*}  {boolean}
 */
export function run(
  group: RuleSetOrGroup,
  value: UnsafeTypes.UnsafeAny,
): boolean {
  // Root groups: reuse prepare() for validation, normalization, and cached runner.
  if (group.node === "root") {
    const runner = prepare(group);
    return runner(value);
  }

  // Nested groups: validate once per call, then compile and run.
  const validated = S.decodeSync(RuleGroup)(S.encodeSync(RuleGroup)(group));
  const runner = createRunner(validated);
  return runner(value);
}
