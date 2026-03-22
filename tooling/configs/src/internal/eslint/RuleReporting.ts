import { thunkUndefined } from "@beep/utils";
import { pipe } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import type { Rule } from "eslint";
import { getAllowlistDiagnostics, isViolationAllowlisted } from "../../eslint/EffectLawsAllowlist.ts";
import type { RuleViolation } from "./RuleViolation.ts";

/**
 * Report allowlist diagnostics for a rule program node.
 *
 * @since 0.0.0
 * @category Utility
 */
export const reportAllowlistDiagnostics = (context: Rule.RuleContext): void => {
  for (const detail of getAllowlistDiagnostics()) {
    context.report({ loc: { line: 1, column: 0 }, messageId: "allowlistInvalid", data: { detail } });
  }
};

type RuleViolationReporter = {
  (violation: RuleViolation, node: Rule.Node): void;
  (node: Rule.Node): (violation: RuleViolation) => void;
};

/**
 * Create a reporter that suppresses allowlisted violations for the given rule/file.
 *
 * @since 0.0.0
 * @category Utility
 */
export const createAllowlistViolationReporter = (params: {
  readonly context: Rule.RuleContext;
  readonly ruleId: string;
  readonly relativeFilePath: string;
}): RuleViolationReporter =>
  dual(2, (violation: RuleViolation, node: Rule.Node): void => {
    const allowlisted = isViolationAllowlisted({
      ruleId: params.ruleId,
      filePath: params.relativeFilePath,
      kind: violation.kind,
    });

    pipe(
      O.liftPredicate((value: boolean) => !value)(allowlisted),
      O.match({
        onNone: thunkUndefined,
        onSome: () =>
          params.context.report({
            node,
            messageId: violation.messageId,
            data: violation.data,
          }),
      })
    );
  });
