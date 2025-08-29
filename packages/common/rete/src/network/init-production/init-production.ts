import type { $Schema, CondFn, ConvertMatchFn, Production, ThenFinallyFn, ThenFn } from "@beep/rete/network/types";

export const initProduction = <TSchema extends $Schema, U>(production: {
  name: string;
  convertMatchFn: ConvertMatchFn<TSchema, U>;
  condFn?: CondFn<TSchema>;
  thenFn?: ThenFn<TSchema, U>;
  thenFinallyFn?: ThenFinallyFn<TSchema, U>;
}): Production<TSchema, U> => {
  return {
    ...production,
    conditions: [],
    subscriptions: new Set(),
  };
};

export default initProduction;
