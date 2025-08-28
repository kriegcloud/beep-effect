import type { FactFragment } from "@beep/rete/rete";

export const defaultInitMatch = <T>() => {
  return new Map<string, FactFragment<T>>();
};

export default defaultInitMatch;
