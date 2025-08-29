import type { $Schema, Binding, MatchT } from "@beep/rete/network/types";

export const bindingsToMatch = <T extends $Schema>(binding: Binding<T> | undefined) => {
  const result: MatchT<T> = new Map();
  let cur = binding;
  while (cur !== undefined) {
    result.set(cur.name, cur.value);
    cur = cur.parentBinding;
  }
  return result;
};

export default bindingsToMatch;
