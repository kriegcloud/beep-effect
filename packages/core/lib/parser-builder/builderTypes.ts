import type { ParserMethod } from '@traqula/chevrotain';
import type { ParserRule } from './ruleDefTypes.js';

/**
 * Get union-type of names used in list of ruledefs.
 */
export type ParseNamesFromList<T extends readonly { name: string }[]> = T[number]['name'];

/**
 * Convert a list of ruledefs to a record that maps each rule name to its definition.
 */
export type ParseRuleMap<RuleNames extends string> = {[Key in RuleNames]: ParserRule<any, Key> };

/**
 * Convert a list of RuleDefs to a Record with the name of the RuleDef as the key, matching the RuleDefMap type.
 */
export type ParseRulesToObject<
  T extends readonly ParserRule[],
  Names extends string = ParseNamesFromList<T>,
  Agg extends Record<string, ParserRule> = Record<never, never>,
> = T extends readonly [infer First, ...infer Rest] ? (
  First extends ParserRule ? (
    Rest extends readonly ParserRule[] ? (
      ParseRulesToObject<Rest, Names, {[K in keyof Agg | First['name']]: K extends First['name'] ? First : Agg[K] }>
    ) : never
  ) : never
) : ParseRuleMap<Names> & Agg;

export type ParserFromRules<Context, Names extends string, RuleDefs extends ParseRuleMap<Names>> = {
  [K in Names]: RuleDefs[K] extends ParserRule<Context, K, infer RET, infer ARGS> ?
      (input: string, context: Context, ...args: ARGS) => RET : never
};

export type ParseMethodsFromRules<Context, Names extends string, RuleDefs extends ParseRuleMap<Names>> = {
  [K in Names]: RuleDefs[K] extends ParserRule<Context, K, infer RET, infer ARGS> ?
    ParserMethod<[Context, ...ARGS], RET> : never
};
