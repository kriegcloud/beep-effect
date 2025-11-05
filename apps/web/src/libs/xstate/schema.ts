import * as S from "effect/Schema";

// Define interfaces for recursive schemas
export interface ICompoundStateNode extends S.Schema.Type<typeof BaseStateNode> {
  readonly type: "compound";
  readonly entry?: ReadonlyArray<S.Schema.Type<typeof ActionObject>> | undefined;
  readonly exit?: ReadonlyArray<S.Schema.Type<typeof ActionObject>> | undefined;
  readonly initial?: S.Schema.Type<typeof InitialTransitionObject> | undefined;
  readonly invoke?: ReadonlyArray<S.Schema.Type<typeof InvokeObject>> | undefined;
  readonly on?: S.Schema.Type<typeof TransitionsObject> | undefined;
  readonly states: Record<string, IStateNode>; // Recursive reference
}

export interface IParallelStateNode extends S.Schema.Type<typeof BaseStateNode> {
  readonly type: "parallel";
  readonly entry?: ReadonlyArray<S.Schema.Type<typeof ActionObject>> | undefined;
  readonly exit?: ReadonlyArray<S.Schema.Type<typeof ActionObject>> | undefined;
  readonly invoke?: ReadonlyArray<S.Schema.Type<typeof InvokeObject>> | undefined;
  readonly on?: S.Schema.Type<typeof TransitionsObject> | undefined;
  readonly states: Record<string, IStateNode>; // Recursive reference
}

export type IStateNode =
  | S.Schema.Type<typeof AtomicStateNode>
  | ICompoundStateNode
  | IParallelStateNode
  | S.Schema.Type<typeof HistoryStateNode>
  | S.Schema.Type<typeof FinalStateNode>;

// actionObject
export const ActionObject = S.Struct({
  type: S.NonEmptyTrimmedString,
}).pipe(S.extend(S.Object));

// baseStateNode
export const BaseStateNode = S.Struct({
  id: S.NonEmptyTrimmedString,
  key: S.NonEmptyTrimmedString,
  type: S.Union(
    S.Literal("atomic"),
    S.Literal("compound"),
    S.Literal("parallel"),
    S.Literal("final"),
    S.Literal("history")
  ),
  order: S.optional(S.Int),
  description: S.optional(S.String),
});

// invokeObject and invokeArray
export const InvokeObject = S.Struct({
  type: S.NonEmptyTrimmedString,
  id: S.NonEmptyTrimmedString,
  src: S.NonEmptyTrimmedString,
});

export const InvokeArray = S.Array(InvokeObject);

// transitionObject and transitionsObject
export const TransitionObject = S.Struct({
  actions: S.Array(ActionObject),
  cond: S.optional(S.Object),
  eventType: S.NonEmptyTrimmedString,
  source: S.NonEmptyTrimmedString,
  target: S.Array(S.NonEmptyTrimmedString),
});

export const TransitionsObject = S.Record({
  key: S.String,
  value: S.Array(TransitionObject),
});

// initialTransitionObject
export const InitialTransitionObject = S.Struct({
  actions: S.Array(ActionObject),
  eventType: S.String,
  source: S.String,
  target: S.Array(S.String).pipe(S.minItems(1)),
});

// State nodes with recursive references using S.suspend
export const AtomicStateNode = S.Struct({
  ...BaseStateNode.fields,
  type: S.Literal("atomic"),
  entry: S.optional(S.Array(ActionObject)),
  exit: S.optional(S.Array(ActionObject)),
  invoke: S.optional(InvokeArray),
  on: TransitionsObject, // Required
});

export const FinalStateNode = S.Struct({
  ...BaseStateNode.fields,
  type: S.Literal("final"),
  data: S.optional(S.Object),
});

export const HistoryStateNode = S.Struct({
  ...BaseStateNode.fields,
  type: S.Literal("history"),
  history: S.Union(S.Literal("shallow"), S.Literal("deep")), // Required
});
// TS7022: CompoundStateNode implicitly has `type` any because it does not have a type annotation and is referenced directly or indirectly in its own initializer.
export const CompoundStateNode: S.Schema<ICompoundStateNode> = S.Struct({
  ...BaseStateNode.fields,
  type: S.Literal("compound"),
  entry: S.optional(S.Array(ActionObject)),
  exit: S.optional(S.Array(ActionObject)),
  initial: S.optional(InitialTransitionObject),
  invoke: S.optional(InvokeArray),
  on: S.optional(TransitionsObject),
  states: S.suspend((): S.Schema<Record<string, IStateNode>> => S.Record({ key: S.String, value: StateNode })),
});

export const ParallelStateNode: S.Schema<IParallelStateNode> = S.Struct({
  ...BaseStateNode.fields,
  type: S.Literal("parallel"),
  entry: S.optional(S.Array(ActionObject)),
  exit: S.optional(S.Array(ActionObject)),
  invoke: S.optional(InvokeArray),
  on: S.optional(TransitionsObject),
  states: S.suspend((): S.Schema<Record<string, IStateNode>> => S.Record({ key: S.String, value: StateNode })),
});

export const StateNode = S.Union(
  AtomicStateNode,
  CompoundStateNode,
  ParallelStateNode,
  HistoryStateNode,
  FinalStateNode
);

// Main schema
export const XStateSchema = S.Struct({
  id: S.String,
  initial: S.optional(InitialTransitionObject),
  key: S.String,
  type: S.Union(S.Literal("compound"), S.Literal("parallel")),
  context: S.optional(S.Object),
  states: S.Record({ key: S.String, value: StateNode }),
  on: S.optional(TransitionsObject),
  transitions: S.optional(S.Array(TransitionObject)),
  entry: S.optional(S.Array(ActionObject)),
  exit: S.optional(S.Array(ActionObject)),
  order: S.optional(S.Int),
  invoke: S.optional(InvokeArray),
  version: S.optional(S.String),
});
