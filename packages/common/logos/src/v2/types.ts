import type { Rule, RuleInput } from "./Rule";
import type { GroupInput, RuleGroup } from "./RuleGroup";
import type { RuleSet } from "./RuleSet";

export type AnyNode = Rule.Type | RuleGroup.Type | RuleSet.Type;
export type RuleSetOrGroup = RuleGroup.Type | RuleSet.Type;
export type RuleOrGroup = RuleGroup.Type | Rule.Type;
export type RuleOrGroupInput = RuleInput.Type | GroupInput.Type;
export type RuleOrUndefined = Rule.Type | undefined;
export type AnyNodeOrUndefined = AnyNode | undefined;
export type SetOrGroupOrUndefined = RuleSetOrGroup | undefined;
