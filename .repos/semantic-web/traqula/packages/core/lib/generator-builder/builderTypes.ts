import type { ParseNamesFromList } from '../parser-builder/builderTypes.js';
import type { GeneratorRule } from './generatorTypes.js';

/**
 * Convert a list of ruledefs to a record that maps each rule name to its definition.
 */
export type GenRuleMap<RuleNames extends string> = {[Key in RuleNames]: GeneratorRule<any, Key> };

/**
 * Convert a list of RuleDefs to a Record with the name of the RuleDef as the key, matching the RuleDefMap type.
 */
export type GenRulesToObject<
  T extends readonly GeneratorRule[],
  Names extends string = ParseNamesFromList<T>,
  Agg extends Record<string, GeneratorRule> = Record<never, never>,
> = T extends readonly [infer First, ...infer Rest] ? (
  First extends GeneratorRule ? (
    Rest extends readonly GeneratorRule[] ? (
      GenRulesToObject<Rest, Names, {[K in keyof Agg | First['name']]: K extends First['name'] ? First : Agg[K] }>
    ) : never
  ) : never
) : GenRuleMap<Names> & Agg;

export type GeneratorFromRules<Context, Names extends string, RuleDefs extends GenRuleMap<Names>> = {
  [K in Names]: RuleDefs[K] extends GeneratorRule<Context, K, infer RET, infer ARGS> ?
      (input: RET, context: Context & { origSource: string; offset?: number }, ...args: ARGS) => string : never
};
