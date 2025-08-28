import type { FactFragment } from "@beep/rete/network/types";

export const defaultInitMatch = <T>() => {
  return new Map<string, FactFragment<T>>();
};

export default defaultInitMatch;
