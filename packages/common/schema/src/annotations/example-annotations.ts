import * as A from "effect/Array";
import type * as B from "effect/Brand";

export const makeBrandedExamples = <const Brand extends string, const A>(
  ...examples: A.NonEmptyReadonlyArray<A>
): A.NonEmptyReadonlyArray<B.Branded<A, Brand>> => A.map(examples, (example) => example as B.Branded<A, Brand>);
