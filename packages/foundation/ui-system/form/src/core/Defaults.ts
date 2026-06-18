/**
 * Schema-first default form values.
 *
 * The same effect schema that validates a form also supplies its initial
 * values: {@link getDefaultFormValues} materializes the schema's constructor
 * defaults via `schema.make({})`. Declare those defaults on the schema with
 * `S.withConstructorDefault` or `@beep/schema`'s `withKeyDefaults`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import type * as S from "effect/Schema";

/**
 * Materializes a schema's constructor defaults into a default form-values
 * object by calling `schema.make({})`.
 *
 * **Totality caveat:** `make({})` succeeds only when *every* field is either
 * defaulted or optional. For a schema with required, non-defaulted fields this
 * throws — declare defaults (`S.withConstructorDefault` / `withKeyDefaults`) or
 * pass explicit `defaultValues` to the form-options builders instead.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * import { getDefaultFormValues } from "@beep/form/core/Defaults"
 *
 * const schema = S.Struct({
 *   name: S.String.pipe(S.withConstructorDefault(Effect.succeed(""))),
 * })
 * console.log(getDefaultFormValues(schema)) // { name: "" }
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const getDefaultFormValues = <Schema extends S.Top>(schema: Schema): Schema["Type"] =>
  schema.make({} as Schema["~type.make.in"]);
