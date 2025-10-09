import type { FactFragment } from "../../network/types";

export const defaultInitMatch = <T>() => {
  return new Map<string, FactFragment<T>>();
};

export default defaultInitMatch;
