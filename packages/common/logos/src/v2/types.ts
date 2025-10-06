import type { Group, GroupInput } from "./Group";
import type { RootGroup } from "./RootGroup";
import type { Rule, RuleInput } from "./Rule";

export type AnyNode = Rule.Type | Group.Type | RootGroup.Type;
export type RootOrGroup = Group.Type | RootGroup.Type;
export type RuleOrGroup = Group.Type | Rule.Type;
export type RuleOrGroupInput = RuleInput.Type | GroupInput.Type;
export type RuleOrUndefined = Rule.Type | undefined;
export type AnyNodeOrUndefined = AnyNode | undefined;
export type RootOrGroupOrUndefined = RootOrGroup | undefined;
