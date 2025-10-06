import type { GroupInput, RootGroup, RuleGroup } from "./groups";
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

export type AnyNode = Rule.Type | RuleGroup.Type | RootGroup.Type;
export type RootOrRuleGroup = RuleGroup.Type | RootGroup.Type;
export type RuleOrRuleGroup = Rule.Type | RuleGroup.Type;
export type RuleOrRuleGroupInput = RuleInput.Type | GroupInput.Type;
export type RuleOrUndefined = Rule.Type | undefined;
export type AnyNodeOrUndefined = AnyNode | undefined;
export type RootOrRuleGroupOrUndefined = RootOrRuleGroup | undefined;

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
