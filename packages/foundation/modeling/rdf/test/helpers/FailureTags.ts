import * as Cause from "effect/Cause";
import * as Exit from "effect/Exit";
import { flow } from "effect/Function";
import * as Result from "effect/Result";
import * as Struct from "effect/Struct";

/**
 * Map tagged failure payloads while retaining every cause reason and annotation.
 *
 * **Details**
 *
 * Cause.map retains failure annotations and every defect/interruption reason.
 * Exit.mapError maps only the first typed failure in the pinned Effect version.
 *
 * **Example** (Keep a defect beside a tagged failure)
 *
 * ```ts
 * import * as Cause from "effect/Cause";
 * import * as Equal from "effect/Equal";
 * import * as Exit from "effect/Exit";
 * import { mapFailureTags } from "./FailureTags.ts";
 *
 * const input = Exit.failCause(Cause.combine(Cause.fail({ _tag: "Invalid" }), Cause.die("defect")));
 * const expected = Exit.failCause(Cause.combine(Cause.fail("Invalid"), Cause.die("defect")));
 * console.log(Equal.equals(mapFailureTags(input), expected)); // true
 * ```
 *
 * @param exit - An exit whose typed failures have a tag.
 * @returns The same success value or a cause with tagged failures and all other reasons intact.
 * @category testing
 * @since 0.0.0
 */
export const mapFailureTags = <A, E extends { readonly _tag: string }>(
  exit: Exit.Exit<A, E>
): Exit.Exit<A, E["_tag"]> =>
  Exit.match(exit, {
    onSuccess: Exit.succeed,
    onFailure: flow(Cause.map<E, E["_tag"]>(Struct.get<E, "_tag">("_tag")), Exit.failCause),
  });

/**
 * Map a tagged `Result` failure to its tag while keeping the success value.
 *
 * **Details**
 *
 * The projection lets `assertFailure` compare the exact error tag instead of only
 * checking that the result failed.
 *
 * **Example** (Compare a decode failure by its tag)
 *
 * ```ts
 * import * as Result from "effect/Result";
 * import { mapResultFailureTag } from "./FailureTags.ts";
 *
 * const failed = Result.fail({ _tag: "SchemaError" as const });
 * console.log(mapResultFailureTag(failed)); // Result.fail("SchemaError")
 * ```
 *
 * @param result - A result whose failure has a tag.
 * @returns The same success value, or the failure's tag.
 * @category testing
 * @since 0.0.0
 */
export const mapResultFailureTag = <A, E extends { readonly _tag: string }>(
  result: Result.Result<A, E>
): Result.Result<A, E["_tag"]> => Result.mapError(result, Struct.get<E, "_tag">("_tag"));
