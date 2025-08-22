import type { GroupInput, RootGroup, RuleGroup } from "./ruleGroup";
import type {
  // ArrayLengthRule,
  // ArrayValueRule,
  // BooleanRule,
  // HasEntryRule,
  // HasKeyRule,
  // HasValueRule,
  // NumberRule,
  Rule,
  RuleInput,
  // StringRule,
} from "./rules";

export type AnyEntity = Rule.Type | RuleGroup.Type | RootGroup.Type;
export type TreeOrRuleGroup = RuleGroup.Type | RootGroup.Type;
export type RuleOrRuleGroup = Rule.Type | RuleGroup.Type;
export type RuleOrRuleGroupInput = RuleInput.Type | GroupInput.Type;
export type RuleOrUndefined = Rule.Type | undefined;
export type AnyEntityOrUndefined = AnyEntity | undefined;
export type TreeOrRuleGroupOrUndefined = TreeOrRuleGroup | undefined;

// type OpsFor<T> =
//   T extends string ? StringRule.Input /* | StringLengthRule.Input ... */ :
//   T extends number ? NumberRule.Input /* | Between */ :
//   T extends boolean ? BooleanRule.Input :
//   T extends Array<infer E> ? /* Array rules specialized for E */ :
//   T extends object ? ObjectRules.Input :
//   never;

// type RuleFor<TSchema extends S.Struct<any>> = {
//   [K in keyof S.Schema.Type<TSchema> & string]:
//     ({ field: K } & OpsFor<S.Schema.Type<TSchema>[K]>)
// }[keyof S.Schema.Type<TSchema> & string];
