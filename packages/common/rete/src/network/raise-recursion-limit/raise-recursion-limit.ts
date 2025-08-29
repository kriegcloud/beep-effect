import type { $Schema, ExecutedNodes } from "@beep/rete/network/types";
import * as Data from "effect/Data";
export const recursionLimitMessage = <T extends $Schema>(limit: number, executedNodes: ExecutedNodes<T>) => {
  const rules: string[] = [];
  for (const node of executedNodes) {
    const key = [...node.keys()][0]!;
    rules.push(key.ruleName);
  }
  // Start at the end, cause we're definitely deep into the loop
  // at the end!
  rules.reverse();
  const endIdx = rules.indexOf(rules[0]!, 1);
  const text =
    endIdx === 1
      ? `${rules[0]} is triggering itself!`
      : `Cycle detected! ${rules.slice(0, endIdx).reverse().join(" -> ")}`;

  return `${text}\nRecursion limit hit. The current limit is ${limit} (set by the recursionLimit param of fireRules).\n NOTE: The first rule mentioned may not be the beginning of the cycle!`;
};

export class RecursionLimitError<T extends $Schema> extends Data.TaggedError("RecursionLimitError")<{
  limit: number;
  executedNodes: ExecutedNodes<T>;
}> {
  constructor(limit: number, executedNodes: ExecutedNodes<T>) {
    super({ limit, executedNodes });
  }
  get message() {
    return recursionLimitMessage(this.limit, this.executedNodes);
  }
}
