import type { CondFn, ConvertMatchFn, Production, ThenFinallyFn, ThenFn } from "@beep/rete/network/types";

export const initProduction = <SCHEMA extends object, U>(production: {
  name: string;
  convertMatchFn: ConvertMatchFn<SCHEMA, U>;
  condFn?: CondFn<SCHEMA>;
  thenFn?: ThenFn<SCHEMA, U>;
  thenFinallyFn?: ThenFinallyFn<SCHEMA, U>;
}): Production<SCHEMA, U> => {
  return {
    ...production,
    conditions: [],
    subscriptions: new Set(),
  };
};

export default initProduction;
