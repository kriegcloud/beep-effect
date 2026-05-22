export * from "effect/Effect";

import * as Effect from "effect/Effect";
import * as Result from "effect/Result";

export type Either<E, A> = { readonly _tag: "Left"; readonly left: E } | { readonly _tag: "Right"; readonly right: A };

export const either = <A, E, R>(self: Effect.Effect<A, E, R>): Effect.Effect<Either<E, A>, never, R> =>
  Effect.map(
    Effect.result(self),
    (result): Either<E, A> =>
      Result.isSuccess(result) ? { _tag: "Right", right: result.success } : { _tag: "Left", left: result.failure }
  );

export const async = <A, E = never, R = never>(
  register: (resume: (effect: Effect.Effect<A, E, R>) => void) => void | Effect.Effect<void, never, R>
): Effect.Effect<A, E, R> => Effect.callback((resume) => register(resume));
