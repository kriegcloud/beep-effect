/**
 * JsonLogic-based evaluator for transition conditions
 * Location: apps/web/src/features/form-system/runtime/jsonLogicEvaluator.ts
 */

import jsonLogic from "json-logic-js";
import type { EvaluationContext, JsonLogicRule } from "../model/types";

export function evaluateJsonLogic(
  rule: JsonLogicRule | undefined,
  ctx: EvaluationContext,
): boolean {
  if (rule === undefined) return true;
  if (typeof rule === "boolean") return rule;

  // Provide a compact data context for rules
  const data = {
    answers: ctx.answers,
    current: ctx.currentStepAnswers ?? {},
    external: ctx.externalContext ?? {},
  };
  try {
    const res = jsonLogic.apply(rule as any, data);
    return Boolean(res);
  } catch {
    // Be conservative: invalid rules evaluate to false
    return false;
  }
}
