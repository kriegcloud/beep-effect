import type { GroupInput, RootGroup, RuleGroup } from "./ruleGroup";
import type { Rule, RuleInput } from "./rules";

export type AnyEntity = Rule.Type | RuleGroup.Type | RootGroup.Type;
export type TreeOrRuleGroup = RuleGroup.Type | RootGroup.Type;
export type RuleOrRuleGroup = Rule.Type | RuleGroup.Type;
export type RuleOrRuleGroupInput = RuleInput.Type | GroupInput.Type;
export type RuleOrUndefined = Rule.Type | undefined;
export type AnyEntityOrUndefined = AnyEntity | undefined;
export type TreeOrRuleGroupOrUndefined = TreeOrRuleGroup | undefined;
