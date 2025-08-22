import type { UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";
import { createRunner, prepare } from "./prepare";
import { RuleGroup } from "./ruleGroup";
import type { TreeOrRuleGroup } from "./types";

/**
 * Run the rules engine against a value.
 * @export
 * @param {TreeOrRuleGroup} group
 * @param {*} value
 * @return {*}  {boolean}
 */
export function run(
  group: TreeOrRuleGroup,
  value: UnsafeTypes.UnsafeAny,
): boolean {
  // Root groups: reuse prepare() for validation, normalization, and cached runner.
  if (group.entity === "root") {
    const runner = prepare(group);
    return runner(value);
  }

  // Nested groups: validate once per call, then compile and run.
  const validated = S.decodeSync(RuleGroup)(S.encodeSync(RuleGroup)(group));
  const runner = createRunner(validated);
  return runner(value);
}
