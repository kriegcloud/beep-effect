import type { Binding, MatchT } from "@beep/rete/network";

export const bindingsToMatch = <T>(binding: Binding<T> | undefined) => {
  const result: MatchT<T> = new Map();
  let cur = binding;
  while (cur !== undefined) {
    result.set(cur.name, cur.value);
    cur = cur.parentBinding;
  }
  return result;
};

export default bindingsToMatch;
