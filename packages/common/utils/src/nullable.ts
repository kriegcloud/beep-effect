import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";

export const nullableToArray = <T>(nullable: T[] | ReadonlyArray<T> | undefined | null): readonly T[] =>
  pipe(O.fromNullable(nullable), O.getOrElse(A.empty<T>));
