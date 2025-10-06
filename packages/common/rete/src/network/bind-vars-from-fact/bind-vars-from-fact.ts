import { ExpectedToHaveAlphaFactsForNode } from "@beep/rete/network/bind-vars-from-fact/errors";
import type { $Schema, Binding, Condition, Fact, Token } from "@beep/rete/network/types";
import { Field } from "@beep/rete/network/types";
import { bindingWasSet } from "../binding-was-set";

export const bindVarsFromFact = <T extends $Schema>(
  condition: Condition<T>,
  fact: Fact<T>,
  token: Token<T>,
  existingBindings?: Binding<T>
): { didBindVar: boolean; binding?: Binding<T> } => {
  let currentBinding = existingBindings;
  for (let i = 0; i < condition.vars.length; i++) {
    const v = condition.vars[i];
    if (v?.field === Field.Enum.IDENTIFIER) {
      const result = bindingWasSet(currentBinding, v.name, fact[0]);
      if (!result.didBindVar) {
        return result;
      }
      currentBinding = result.binding;
    } else if (v?.field === Field.Enum.ATTRIBUTE) {
      throw new ExpectedToHaveAlphaFactsForNode(v);
    } else if (v?.field === Field.Enum.VALUE) {
      const results = bindingWasSet(currentBinding, v.name, fact[2]);
      if (!results.didBindVar) {
        return results;
      }
      currentBinding = results.binding;
    }
  }
  return { didBindVar: true, binding: currentBinding };
};

export default bindVarsFromFact;
