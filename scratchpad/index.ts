/**
 * A template demonstrating proper documentation for this repo
 *
 * @module @beep/scratchpad/
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $SchemaId.create("MySchema");

/**
 * A schema that validates a string value.
 *
 * This schema can be used to validate unknown inputs or encode types
 * into a format that conforms to string values.
 *
 * ## Use Cases
 *
 * - Input validation where strings are the expected data type.
 * - Type-safe transformations when encoding or decoding values.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 *
 * const schema = S.String;
 *
 * // Validating a value
 * const decodeResult = S.decodeUnknown(schema)("Hello, world!");
 * if (S.isSuccess(decodeResult)) {
 *   console.log(decodeResult.value); // "Hello, world!"
 * } else {
 *   console.error(decodeResult.error); // Decoding error details
 * }
 *
 * // Encoding a value
 * const encodedValue = S.encode(schema)("Hello, world!");
 * console.log(encodedValue); // "Hello, world!"
 * ```
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 *
 * // Schema composition
 * const UserInput = S.Struct({
 *   name: S.String,
 *   email: S.String
 * });
 *
 * const user = {
 *   name: "Alice",
 *   email: "alice@example.com",
 * };
 *
 * const validation = S.decodeUnknownEffect(UserInput)(user);
 *
 * const program = Effect.gen(function* () {
 *   const validatedUser = yield* validation;
 *   console.log(validatedUser); // { name: "Alice", email: "alice@example.com" }
 *   return validatedUser;
 * });
 * ```
 *
 * @see {@link S.String}
 * @since 0.0.0
 * @category Utility
 */
export const MySchema: S.String = S.String;

/**
 * An error type that indicates that the input is not a string.
 *
 * @since 0.0.0
 * @category Error
 */
export class NotMySchemaError extends TaggedErrorClass<NotMySchemaError>($I`NotMySchemaError`)(
  "NotMySchemaError",
  {
    message: S.String,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("NotMySchemaError", {
    description: "An error type that indicates that the input is not a string.",
  })
) {
  /**
   * Creates a new NotMySchemaError instance for invalid string inputs.
   *
   * @returns {NotMySchemaError} - A new instance of NotMySchemaError.
   * @param input {unknown} - The input value that is not a string.
   * @param cause {?unknown} - The optional cause of the error.
   */
  static override readonly new = (input: unknown, cause?: unknown): NotMySchemaError =>
    new NotMySchemaError({
      message: `Expected string, got ${typeof input}`,
      cause: O.some(cause ?? input),
    });
}

/**
 * Asserts that the input is a string.
 *
 * @example
 * ```ts
 * import { assertIsMySchema } from "@beep/some-package";
 *
 * const someFn = (input: unknown) => {
 *   // invariant
 *   assertIsMySchema(input);
 *
 *   // ...
 * }
 * ```
 *
 * @category Validation
 * @param u {unknown} - The input value to validate.
 * @returns {asserts u is string} - An assertion that the input is a string.
 * @throws {NotMySchemaError} - Throws a NotMySchemaError if the input is not a string.
 * @since 0.0.0
 */
export const assertIsMySchema: (u: unknown) => asserts u is string = (u: unknown): asserts u is string => {
  try {
    return S.asserts(MySchema)(u);
  } catch (e) {
    throw NotMySchemaError.new(u, e);
  }
};
