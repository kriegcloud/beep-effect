import * as Match from "effect/Match";
import type * as Unify from "effect/Unify";

// --- Claim A: current MatchReturn drops unary handlers under strictFunctionTypes
type MatchReturnCurrent<Cases> = {
  [K in keyof Cases]: Cases[K] extends (...args: ReadonlyArray<unknown>) => infer R ? R : never;
}[keyof Cases];
type MatchReturnFixed<Cases> = {
  [K in keyof Cases]: Cases[K] extends (...args: infer _A) => infer R ? R : never;
}[keyof Cases];

type Cases1 = { ready: (v: "ready") => number; blocked: (v: "blocked") => string };
type Cases2 = { ready: () => number; blocked: () => string };
type Cases3 = { ready: (v: "ready") => number; blocked: () => string };

type IsNever<T> = [T] extends [never] ? true : false;
export const a1: IsNever<MatchReturnCurrent<Cases1>> = true; // expect: compiles if claim holds
export const a2: MatchReturnCurrent<Cases2> = 1 as number | string; // zero-arg still works
export const a3: IsNever<Extract<MatchReturnCurrent<Cases3>, number>> = true; // unary number dropped
export const f1: MatchReturnFixed<Cases1> = 1 as number | string;
export const f3: MatchReturnFixed<Cases3> = 1 as number | string;

// --- Claim B: whenOr(...Kit.literals, Kit.match(cases)) composes in a Match chain with no new API
type Status = "ready" | "blocked";
const literals = ["ready", "blocked"] as const;
declare const curriedMatch: <
  const C extends { readonly ready: (v: "ready") => unknown; readonly blocked: (v: "blocked") => unknown },
>(
  cases: C
) => (value: Status) => Unify.Unify<MatchReturnFixed<C>>;

export const classify = Match.type<Status | "queued">().pipe(
  Match.withReturnType<number>(),
  Match.whenOr(...literals, curriedMatch({ ready: () => 1, blocked: () => 2 })),
  Match.when("queued", () => 0),
  Match.exhaustive
);
type Classify = typeof classify;
export const bCheck: Classify = (_: Status | "queued"): number => 0;

// B2: omitting "queued" must fail exhaustive
export const classifyMissing = Match.type<Status | "queued">().pipe(
  Match.whenOr(...literals, curriedMatch({ ready: () => 1, blocked: () => 2 })),
  Match.exhaustive
);
