/**
 * Schema helpers for functions that accept no arguments and return void.
 *
 * Built on top of the generic {@link Fn} wrapper so annotations and runtime validation stay consistent.
 *
 * @example
 * import { Schema, implement } from "@beep/schema-v2/primitives/fn/no-input-void-fn/no-input-void-fn";
 *
 * const handler = implement((_ignored: void) => {
 *   // side effects
 * });
 *
 * handler(undefined);
 *
 * @category Primitives/Fn
 * @since 0.1.0
 */

import { Fn } from "@beep/schema-v2/primitives/fn/fn";
import * as S from "effect/Schema";
import { Id } from "./_id";

const noInputVoidFn = new Fn({
  input: S.Any,
  output: S.Void,
});

/**
 * Schema describing a function that takes no input and returns void.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Schema } from "@beep/schema-v2/primitives/fn/no-input-void-fn/no-input-void-fn";
 *
 * S.decodeSync(Schema)((_: void) => undefined);
 *
 * @category Primitives/Fn
 * @since 0.1.0
 */
export const Schema = noInputVoidFn.Schema.annotations(
  Id.annotations("no-input-void-fn/Schema", {
    description: "Function schema that validates zero-argument void callbacks.",
  })
);

/**
 * Helper to wrap an arbitrary implementation with {@link Schema} validation.
 *
 * @example
 * import { implement } from "@beep/schema-v2/primitives/fn/no-input-void-fn/no-input-void-fn";
 *
 * const fn = implement((_value: void) => console.log("ran"));
 *
 * @category Primitives/Fn
 * @since 0.1.0
 */
export const implement = noInputVoidFn.implement;

/**
 * Namespace exposing runtime and encoded types for {@link Schema}.
 *
 * @example
 * import type { NoInputVoidFn } from "@beep/schema-v2/primitives/fn/no-input-void-fn/no-input-void-fn";
 *
 * type Handler = NoInputVoidFn.Type;
 *
 * @category Primitives/Fn
 * @since 0.1.0
 */
export declare namespace NoInputVoidFn {
  /**
   * Runtime function type validated by {@link Schema}.
   *
   * @example
   * import type { NoInputVoidFn } from "@beep/schema-v2/primitives/fn/no-input-void-fn/no-input-void-fn";
   *
   * let handler: NoInputVoidFn.Type;
   *
   * @category Primitives/Fn
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof Schema>;
  /**
   * Encoded representation accepted by {@link Schema}.
   *
   * @example
   * import type { NoInputVoidFn } from "@beep/schema-v2/primitives/fn/no-input-void-fn/no-input-void-fn";
   *
   * let encoded: NoInputVoidFn.Encoded;
   *
   * @category Primitives/Fn
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof Schema>;
}
