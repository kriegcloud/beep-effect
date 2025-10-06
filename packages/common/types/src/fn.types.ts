import type * as P from "effect/Predicate";

export type Guard<A, B extends A> = P.Refinement<A, B>;

export type NotGuard<A, B extends A> = (g: Guard<A, B>) => (x: A) => x is Exclude<A, B>;
