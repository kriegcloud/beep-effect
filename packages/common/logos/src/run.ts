import type { UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";
import { RuleGroup } from "./groups";
import { createRunner, prepare } from "./prepare";
import type { RootOrRuleGroup } from "./types";

/**
 * Run the rules engine against a value.
 * @export
 * @param {RootOrRuleGroup} group
 * @param {*} value
 * @return {*}  {boolean}
 */
export function run(
  group: RootOrRuleGroup,
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
