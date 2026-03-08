import type { ParseNamesFromList } from '../parser-builder/builderTypes.js';

export type IndirDef<
  Context = any,
  NameType extends string = string,
  ReturnType = unknown,
  ParamType extends any[] = any[],
> = {
  name: NameType;
  fun: (def: IndirDefArg) => (c: Context, ...params: ParamType) => ReturnType;
};

export type IndirDefArg = {
  /**
   * Calls another rule using the provided arguments.
   * @param rule
   * @param arg
   * @constructor
   */
  SUBRULE: <T, U extends any[]>(rule: IndirDef<any, any, T, U>, ...arg: U) => T;
};

export type IndirectionMap<RuleNames extends string> = {[Key in RuleNames]: IndirDef<any, Key> };

/**
 * Converts a list of ruledefs to a record mapping a name to the corresponding ruledef.
 */
export function listToIndirectionMap<T extends readonly IndirDef[]>(rules: T): ParseIndirsToObject<T> {
  const newRules: Record<string, IndirDef> = {};
  for (const rule of rules) {
    newRules[rule.name] = rule;
  }
  return <ParseIndirsToObject<T>>newRules;
}

/**
 * Convert a list of IndirDefs to a Record with the name of the IndirDef as the key, matching the IndirectionMap type.
 */
export type ParseIndirsToObject<
  T extends readonly IndirDef[],
  Names extends string = ParseNamesFromList<T>,
  Agg extends Record<string, IndirDef> = Record<never, never>,
> = T extends readonly [infer First, ...infer Rest] ? (
  First extends IndirDef ? (
    Rest extends readonly IndirDef[] ? (
      ParseIndirsToObject<Rest, Names, {[K in keyof Agg | First['name']]: K extends First['name'] ? First : Agg[K] }>
    ) : never
  ) : never
) : IndirectionMap<Names> & Agg;

export type IndirectObjFromIndirDefs<Context, Names extends string, RuleDefs extends IndirectionMap<Names>> = {
  [K in Names]: RuleDefs[K] extends IndirDef<Context, K, infer RET, infer ARGS> ?
      (context: Context, ...args: ARGS) => RET : never
};
