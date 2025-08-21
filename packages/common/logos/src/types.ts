import type { Rule, RuleInput } from "./rules";
import type { RootUnion, Union, UnionInput } from "./union";

export type AnyEntity = Rule.Type | Union.Type | RootUnion.Type;
export type AnyUnion = Union.Type | RootUnion.Type;
export type RuleOrUnion = Rule.Type | Union.Type;
export type RuleOrUnionInput = RuleInput.Type | UnionInput.Type;
export type RuleOrUndefined = Rule.Type | undefined;
export type AnyEntityOrUndefined = AnyEntity | undefined;
export type AnyUnionOrUndefined = AnyUnion | undefined;
