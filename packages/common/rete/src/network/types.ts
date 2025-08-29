// This is a map of string to one of the elements of a fact tuple
// So for a fact ["bob", "age", 13] this could be a map from
// string to string | number

import type { StructTypes, UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import type { Auditor } from "./audit";
export type ValueOf<T> = T[keyof T];
export type FactFragment<TSchema> = FactId.Type | keyof TSchema | ValueOf<TSchema>;
export type MatchT<TSchema> = Map<string, FactFragment<TSchema>>;
export type QueryFilter<TSchema> = Map<string, FactFragment<TSchema>[]>;

export type $Schema<T extends StructTypes.StructFieldsWithStringKeys = StructTypes.StructFieldsWithStringKeys> = {
  readonly [K in keyof T]: S.Schema.Type<T[K]>;
};

export enum PRODUCTION_ALREADY_EXISTS_BEHAVIOR {
  QUIET = 0,
  WARN = 1,
  ERROR = 2,
}

export class Field extends S.Enums({
  IDENTIFIER: 0,
  ATTRIBUTE: 1,
  VALUE: 2,
} as const) {
  static readonly Enum = Field.enums;
}

export namespace Field {
  export type Type = S.Schema.Type<typeof Field>;
  export type Encoded = S.Schema.Encoded<typeof Field>;
  export type Enum = typeof Field.enums;
}

// Shorten that name a bit

export type InternalFactRepresentation<TSchema extends $Schema> = readonly [
  FactId.Type,
  keyof TSchema,
  UnsafeTypes.UnsafeAny,
];
export const internalFactRepresentation = <const TSchema extends $Schema>(schema: TSchema) =>
  S.Tuple(FactId, S.Literal(...Struct.keys(schema)), S.Any);
export type Fact<T extends $Schema> = InternalFactRepresentation<T>;

export type IdAttr<S> = [FactId.Type, keyof S];
export type IdAttrs<S> = IdAttr<S>[];

export class TokenKind extends S.Enums({
  INSERT: 0,
  RETRACT: 1,
  UPDATE: 2,
} as const) {
  static readonly Enum = TokenKind.enums;
}

export namespace TokenKind {
  export type Type = S.Schema.Type<typeof TokenKind>;
  export type Encoded = S.Schema.Encoded<typeof TokenKind>;
  export type Enum = typeof TokenKind.enums;
}

export interface Binding<T> {
  name: string;
  value: FactFragment<T>;
  parentBinding?: Binding<T>;
}

export interface Token<T extends $Schema> {
  fact: Fact<T>;
  kind: TokenKind.Type;
  // Only for Update Tokens
  oldFact?: Fact<T>;
}

/** Matches **/
export class Var extends S.Struct({
  name: S.NonEmptyString,
  field: Field,
}).pipe(S.mutable) {}

export namespace Var {
  export type Type = S.Schema.Type<typeof Var>;
  export type Encoded = S.Schema.Encoded<typeof Var>;
}
export const FactId = S.Union(S.Number, S.String, Var);
export namespace FactId {
  export type Type = typeof FactId.Type;
  export type Encoded = typeof FactId.Encoded;
}

export interface Match<T> {
  id: number;
  // vars?: MatchT<T>
  bindings?: Binding<T>;
  enabled?: boolean;
}

/** functions **/
export type ThenFn<T extends $Schema, U> = (then: {
  session: Session<T>;
  rule: Production<T, U>;
  vars: U;
}) => Promise<void> | void;
export type WrappedThenFn<TSchema> = (vars: MatchT<TSchema>) => Promise<void> | void;
export type ThenFinallyFn<T extends $Schema, U> = (session: Session<T>, rule: Production<T, U>) => Promise<void> | void;
export type WrappedThenFinallyFn = () => Promise<void> | void;
export type ConvertMatchFn<T, U> = (vars: MatchT<T>) => U;
export type CondFn<T> = (vars: MatchT<T>) => boolean;
export type InitMatchFn<T> = () => MatchT<T>;

/** Alpha Network **/
export interface AlphaNode<T extends $Schema> {
  id: number;
  testField?: Field.Type;
  testValue?: keyof T | FactId.Type;

  facts: Map<string, Map<string, Fact<T>>>;
  successors: JoinNode<T>[];
  children: AlphaNode<T>[];
}

export class MEMORY_NODE_TYPE extends S.Enums({
  PARTIAL: 0,
  LEAF: 1,
} as const) {
  static readonly Enum = MEMORY_NODE_TYPE.enums;
}

export namespace MEMORY_NODE_TYPE {
  export type Type = S.Schema.Type<typeof MEMORY_NODE_TYPE>;
  export type Encoded = S.Schema.Encoded<typeof MEMORY_NODE_TYPE>;
  export type Enum = typeof MEMORY_NODE_TYPE.enums;
}

export class IdAttrsHash extends S.Number {}

export namespace IdAttrsHash {
  export type Type = S.Schema.Type<typeof IdAttrsHash>;
  export type Encoded = S.Schema.Encoded<typeof IdAttrsHash>;
}

export interface MemoryNode<T extends $Schema> {
  id: number;
  parent: JoinNode<T>;
  child?: JoinNode<T>;
  leafNode?: MemoryNode<T>;
  lastMatchId: number;
  // matches key is a
  matches: Map<IdAttrsHash.Type, { idAttrs: IdAttrs<T>; match: Match<T> }>;
  matchIds: Map<IdAttrsHash.Type, IdAttrs<T>>;
  condition: Condition<T>;
  ruleName: string;
  type: MEMORY_NODE_TYPE.Type;
  nodeType?: LeafNode<T>;
}

export interface LeafNode<T> {
  condFn?: CondFn<T>;
  thenFn?: WrappedThenFn<T>;
  thenFinallyFn?: WrappedThenFinallyFn;
  trigger?: boolean;
}

export interface JoinNode<T extends $Schema> {
  id: number;
  parent?: MemoryNode<T>;
  child?: MemoryNode<T>;
  alphaNode: AlphaNode<T>;
  condition: Condition<T>;
  idName?: string;
  oldIdAttrs: Set<IdAttrsHash.Type>;
  disableFastUpdates?: boolean;
  ruleName: string;
}

/** Session **/

export interface Condition<T extends $Schema> {
  nodes: [Field.Type, keyof T | FactId.Type][];
  vars: Array<Var.Type>;
  shouldTrigger: boolean;
}

export interface Production<T extends $Schema, U> {
  name: string;
  conditions: Condition<T>[];
  convertMatchFn: ConvertMatchFn<T, U>;
  subscriptions: Set<{
    callback: (results: U[]) => void;
    filter?: QueryFilter<T>;
  }>;
  condFn?: CondFn<T>;
  thenFn?: ThenFn<T, U>;
  thenFinallyFn?: ThenFinallyFn<T, U>;
}

// TODO: store the WMEs in a singular data structure and reference by index?
// internally we would look up an id or attr by name once and use the index
// Throughout the rest of the algorithm.
//
// This would likely simplify cacheline targeted optimizations and/or table
// oriented redactors?
export interface Session<T extends $Schema> {
  alphaNode: AlphaNode<T>;
  leafNodes: Map<string, MemoryNode<T>>;
  idAttrNodes: Map<IdAttrsHash.Type, { alphaNodes: Set<AlphaNode<T>>; idAttr: IdAttr<T> }>;
  insideRule: boolean;
  thenQueue: Set<[node: MemoryNode<T>, idAttrsHash: IdAttrsHash.Type]>;
  thenFinallyQueue: Set<MemoryNode<T>>;
  triggeredNodeIds: Set<MemoryNode<T>>;
  subscriptionsOnProductions: Map<string, () => void>;
  triggeredSubscriptionQueue: Set<string>;
  autoFire: boolean;
  initMatch: InitMatchFn<T>;
  nextId: () => number;
  auditor?: Auditor;
}

export type ExecutedNodes<T extends $Schema> = Map<MemoryNode<T>, Set<MemoryNode<T>>>[];
