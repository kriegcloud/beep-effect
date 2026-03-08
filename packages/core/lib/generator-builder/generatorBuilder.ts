import type { ParseNamesFromList } from '../parser-builder/builderTypes.js';
import type { CheckOverlap } from '../utils.js';
import type { GeneratorFromRules, GenRuleMap, GenRulesToObject } from './builderTypes.js';
import { DynamicGenerator } from './dynamicGenerator.js';
import type { GeneratorRule } from './generatorTypes.js';

/**
 * Converts a list of ruledefs to a record mapping a name to the corresponding ruledef.
 */
function listToRuleDefMap<T extends readonly GeneratorRule[]>(rules: T): GenRulesToObject<T> {
  const newRules: Record<string, GeneratorRule> = {};
  for (const rule of rules) {
    newRules[rule.name] = rule;
  }
  return <GenRulesToObject<T>>newRules;
}

export class GeneratorBuilder<Context, Names extends string, RuleDefs extends GenRuleMap<Names>> {
  /**
   * Create a GeneratorBuilder from some initial grammar rules or an existing GeneratorBuilder.
   * If a GeneratorBuilder is provided, a new copy will be created.
   */
  public static create<Context, Names extends string, RuleDefs extends GenRuleMap<Names>>(
    args: GeneratorBuilder<Context, Names, RuleDefs>
  ): GeneratorBuilder<Context, Names, RuleDefs>;
  public static create<
    Rules extends readonly GeneratorRule[] = readonly GeneratorRule[],
    Context = Rules[0] extends GeneratorRule<infer context> ? context : never,
    Names extends string = ParseNamesFromList<Rules>,
    RuleDefs extends GenRuleMap<Names> = GenRulesToObject<Rules>,
  >(rules: Rules): GeneratorBuilder<Context, Names, RuleDefs>;
  public static create<
    Rules extends readonly GeneratorRule[] = readonly GeneratorRule[],
    Context = Rules[0] extends GeneratorRule<infer context> ? context : never,
    Names extends string = ParseNamesFromList<Rules>,
    RuleDefs extends GenRuleMap<Names> = GenRulesToObject<Rules>,
  >(
    start: Rules | GeneratorBuilder<Context, Names, RuleDefs>,
  ): GeneratorBuilder<Context, Names, RuleDefs> {
    if (Array.isArray(start)) {
      return <GeneratorBuilder<Context, Names, RuleDefs>> <unknown> new GeneratorBuilder(listToRuleDefMap(start));
    }
    return new GeneratorBuilder({ ...(<GeneratorBuilder<any, any, any>>start).rules });
  }

  private rules: RuleDefs;

  private constructor(startRules: RuleDefs) {
    this.rules = startRules;
  }

  public widenContext<NewContext extends Context>(): GeneratorBuilder<
    NewContext,
    Names,
    {[Key in keyof RuleDefs]: Key extends Names ?
        (RuleDefs[Key] extends GeneratorRule<any, any, infer RT, infer PT> ?
          GeneratorRule<NewContext, Key, RT, PT> : never)
      : never }
  > {
    return <any> this;
  }

  public typePatch<Patch extends {[Key in Names]?: [any] | [any, any[]]}>():
  GeneratorBuilder<Context, Names, {[Key in Names]: Key extends keyof Patch ? (
    Patch[Key] extends [any, any[]] ? GeneratorRule<Context, Key, Patch[Key][0], Patch[Key][1]> : (
      // Only  one - infer arg yourself
      Patch[Key] extends [ any ] ?
        RuleDefs[Key] extends GeneratorRule<any, any, any, infer Par> ?
          GeneratorRule<Context, Key, Patch[Key][0], Par> : never
        : never
    )) : RuleDefs[Key] extends GeneratorRule<any, Key> ? RuleDefs[Key] : never
  }> {
    return <any> this;
  }

  /**
   * Change the implementation of an existing generator rule.
   */
  public patchRule<U extends Names, RET, ARGS extends any[]>(patch: GeneratorRule<Context, U, RET, ARGS>):
  GeneratorBuilder<Context, Names, {[Key in Names]: Key extends U ?
    GeneratorRule<Context, Key, RET, ARGS> :
      (RuleDefs[Key] extends GeneratorRule<Context, Key> ? RuleDefs[Key] : never)
  } > {
    const self = <GeneratorBuilder<Context, Names, {[Key in Names]: Key extends U ?
      GeneratorRule<Context, Key, RET, ARGS> :
        (RuleDefs[Key] extends GeneratorRule<Context, Key> ? RuleDefs[Key] : never) }>>
      <unknown> this;
    self.rules[patch.name] = <any> patch;
    return self;
  }

  /**
   * Add a rule to the grammar. If the rule already exists, but the implementation differs, an error will be thrown.
   */
  public addRuleRedundant<U extends string, RET, ARGS extends any[]>(rule: GeneratorRule<Context, U, RET, ARGS>):
  GeneratorBuilder<Context, Names | U, {[K in Names | U]: K extends Names ?
      (RuleDefs[K] extends GeneratorRule<Context, K> ? RuleDefs[K] : never)
    : (K extends U ? GeneratorRule<Context, K, RET, ARGS> : never)
  }> {
    const self = <GeneratorBuilder<Context, Names | U, {[K in Names | U]: K extends Names ?
        (RuleDefs[K] extends GeneratorRule<Context, K> ? RuleDefs[K] : never)
      : (K extends U ? GeneratorRule<Context, K, RET, ARGS> : never) }>>
      <unknown> this;
    const rules = <Record<string, GeneratorRule<Context>>> self.rules;
    if (rules[rule.name] !== undefined && rules[rule.name] !== rule) {
      throw new Error(`Rule ${rule.name} already exists in the GeneratorBuilder`);
    }
    rules[rule.name] = rule;
    return self;
  }

  /**
   * Add a rule to the grammar. Will raise a typescript error if the rule already exists in the grammar.
   */
  public addRule<U extends string, RET, ARGS extends any[]>(
    rule: CheckOverlap<U, Names, GeneratorRule<Context, U, RET, ARGS>>,
  ): GeneratorBuilder<Context, Names | U, {[K in Names | U]: K extends Names ?
      (RuleDefs[K] extends GeneratorRule<Context, K> ? RuleDefs[K] : never)
    : (K extends U ? GeneratorRule<Context, K, RET, ARGS> : never)
  }> {
    return this.addRuleRedundant(rule);
  }

  public addMany<U extends readonly GeneratorRule<Context>[]>(
    ...rules: CheckOverlap<ParseNamesFromList<U>, Names, U>
  ): GeneratorBuilder<
    Context,
    Names | ParseNamesFromList<U>,
    {[K in Names | ParseNamesFromList<U>]:
      K extends keyof GenRulesToObject<typeof rules> ? (
        GenRulesToObject<typeof rules>[K] extends GeneratorRule<Context, K> ? GenRulesToObject<typeof rules>[K] : never
      ) : (
        K extends Names ? (RuleDefs[K] extends GeneratorRule<Context, K> ? RuleDefs[K] : never) : never
      )
    }
  > {
    this.rules = { ...this.rules, ...listToRuleDefMap(rules) };
    return <any> <unknown> this;
  }

  /**
   * Delete a grammar rule by its name.
   */
  public deleteRule<U extends Names>(ruleName: U):
  GeneratorBuilder<Context, Exclude<Names, U>, {[K in Exclude<Names, U>]:
    RuleDefs[K] extends GeneratorRule<Context, K> ? RuleDefs[K] : never }> {
    delete this.rules[ruleName];
    return <GeneratorBuilder<Context, Exclude<Names, U>, {[K in Exclude<Names, U>]:
      RuleDefs[K] extends GeneratorRule<Context, K> ? RuleDefs[K] : never }>>
      <unknown> this;
  }

  public getRule<U extends Names>(ruleName: U): RuleDefs[U] extends GeneratorRule<any, U, infer RT, infer PT> ?
    GeneratorRule<Context, U, RT, PT> : never {
    return <any> this.rules[ruleName];
  }

  /**
   * Merge this grammar GeneratorBuilder with another.
   * It is best to merge the bigger grammar with the smaller one.
   * If the two builders both have a grammar rule with the same name,
   * no error will be thrown case they map to the same ruledef object.
   * If they map to a different object, an error will be thrown.
   * To fix this problem, the overridingRules array should contain a rule with the same conflicting name,
   * this rule implementation will be used.
   */
  public merge<
    OtherNames extends string,
    OtherRules extends GenRuleMap<OtherNames>,
    OW extends readonly GeneratorRule<Context>[],
  >(
    GeneratorBuilder: GeneratorBuilder<Context, OtherNames, OtherRules>,
    overridingRules: OW,
  ):
    GeneratorBuilder<
      Context,
      Names | OtherNames | ParseNamesFromList<OW>,
      {[K in Names | OtherNames | ParseNamesFromList<OW>]:
        K extends keyof GenRulesToObject<OW> ? (
          GenRulesToObject<OW>[K] extends GeneratorRule<Context, K> ? GenRulesToObject<OW>[K] : never
        )
          : (
              K extends Names ? (RuleDefs[K] extends GeneratorRule<Context, K> ? RuleDefs[K] : never)
                : K extends OtherNames ? (OtherRules[K] extends GeneratorRule<Context, K> ? OtherRules[K] : never)
                  : never
            ) }
    > {
    // Assume the other grammar is bigger than yours. So start from that one and add this one
    const otherRules: Record<string, GeneratorRule<Context>> = { ...GeneratorBuilder.rules };
    const myRules: Record<string, GeneratorRule<Context>> = this.rules;

    for (const rule of Object.values(myRules)) {
      if (otherRules[rule.name] === undefined) {
        otherRules[rule.name] = rule;
      } else {
        const existingRule = otherRules[rule.name];
        // If same rule, no issue, move on. Else
        if (existingRule !== rule) {
          const override = overridingRules.find(x => x.name === rule.name);
          // If override specified, take override, else, inform user that there is a conflict
          if (override) {
            otherRules[rule.name] = override;
          } else {
            throw new Error(`Rule with name "${rule.name}" already exists in the GeneratorBuilder, specify an override to resolve conflict`);
          }
        }
      }
    }

    this.rules = <any> <unknown> otherRules;
    return <any> <unknown> this;
  }

  public build(): GeneratorFromRules<Context, Names, RuleDefs> {
    return <GeneratorFromRules<Context, Names, RuleDefs>> new DynamicGenerator(this.rules);
  }
}
