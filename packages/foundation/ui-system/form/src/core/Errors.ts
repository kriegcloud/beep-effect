/**
 * Mapping TanStack field errors into the `@beep/ui` `FieldError` shape.
 *
 * `Schema.toStandardSchemaV1` runs with `errors: "all"`, so TanStack buckets a
 * flat list of `{ message, path }` issues onto each field's
 * `state.meta.errors`. {@link toFieldErrors} normalizes that heterogeneous list
 * (issues or bare strings) into the `{ message }` entries `FieldError` renders.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as A from "effect/Array";
import * as P from "effect/Predicate";

/**
 * A single renderable field error, structurally compatible with `@beep/ui`'s
 * `FieldError` `errors` entries.
 *
 * @example
 * ```ts
 * import type { FieldErrorEntry } from "@beep/form/core/Errors"
 *
 * const entry = { message: "Required" } satisfies FieldErrorEntry
 * console.log(entry.message) // "Required"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface FieldErrorEntry {
  readonly message?: string | undefined;
}

const toEntries = (error: unknown): ReadonlyArray<FieldErrorEntry> => {
  if (P.isString(error)) {
    return A.make({ message: error });
  }
  if (P.isObject(error) && P.hasProperty(error, "message") && P.isString(error.message)) {
    return A.make({ message: error.message });
  }
  return A.empty();
};

/**
 * Normalizes a TanStack `field.state.meta.errors` list into `FieldError`
 * entries, dropping anything without a string message.
 *
 * @example
 * ```ts
 * import { toFieldErrors } from "@beep/form/core/Errors"
 *
 * console.log(toFieldErrors([{ message: "Required" }, "Too short", null]))
 * // [{ message: "Required" }, { message: "Too short" }]
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const toFieldErrors = (errors: ReadonlyArray<unknown> | undefined): ReadonlyArray<FieldErrorEntry> =>
  errors === undefined ? A.empty() : A.flatMap(errors, toEntries);
