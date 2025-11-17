/**
 * Example annotation helpers for schema docs.
 *
 * Provides branded example utilities that keep documentation outputs consistent.
 *
 * @example
 * import { makeBrandedExamples } from "@beep/schema-v2/core/annotations/example-annotations";
 *
 * const emails = makeBrandedExamples<"Email", string>("ops@example.com");
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
import * as A from "effect/Array";
import type * as B from "effect/Brand";
import * as F from "effect/Function";

/**
 * Casts concrete example values into branded equivalents for documentation samples.
 *
 * @example
 * import { makeBrandedExamples } from "@beep/schema-v2/core/annotations/example-annotations";
 *
 * const examples = makeBrandedExamples<"Email", string>("ops@example.com", "billing@example.com");
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const makeBrandedExamples = <const Brand extends string, const Value>(
  ...examples: A.NonEmptyReadonlyArray<Value>
): A.NonEmptyReadonlyArray<B.Branded<Value, Brand>> =>
  F.pipe(
    examples,
    A.map((example) => example as B.Branded<Value, Brand>)
  );
