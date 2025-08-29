import React from "react";
import type { $Schema } from "../network";
import type { ConditionArgs, EnactArgs, EnactionResults, QueryArgs } from "./types";

export const useRuleOne = <TSchema extends $Schema, T extends ConditionArgs<TSchema>>(
  rule: EnactionResults<TSchema, T>,
  filter?: undefined | QueryArgs<TSchema, T>
) => {
  rule.queryOne(filter);
  const [match, setMatch] = React.useState<EnactArgs<TSchema, T> | undefined>(undefined);

  React.useEffect(() => rule.subscribeOne((d) => setMatch(d), filter), [rule, filter, setMatch]);

  return match;
};

export const useRule = <TSchema extends $Schema, T extends ConditionArgs<TSchema>>(
  rule: EnactionResults<TSchema, T>,
  filter?: QueryArgs<TSchema, T>
) => {
  const [match, setMatch] = React.useState<EnactArgs<TSchema, T>[] | undefined>(undefined);
  React.useEffect(() => rule.subscribe((d) => setMatch(d), filter), [setMatch, rule, filter]);

  return match;
};
