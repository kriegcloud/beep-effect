import type { ExecutedNodes } from "@beep/rete/rete";

export const recursionLimitMessage = <T extends object>(limit: number, executedNodes: ExecutedNodes<T>) => {
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

  throw new Error(
    `${text}\nRecursion limit hit. The current limit is ${limit} (set by the recursionLimit param of fireRules).\n NOTE: The first rule mentioned may not be the beginning of the cycle!`
  );
};
export const raiseRecursionLimit = <T extends object>(limit: number, executedNodes: ExecutedNodes<T>) => {
  throw new Error(recursionLimitMessage(limit, executedNodes));
};
