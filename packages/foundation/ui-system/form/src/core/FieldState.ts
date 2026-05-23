/**
 * Render-facing form field state models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import type * as O from "effect/Option";
import type * as S from "effect/Schema";

/**
 * Encoded value type for either a schema or an already-materialized value.
 *
 * @example
 * ```ts
 * import type { FieldValue } from "@beep/form/core/FieldState"
 * import * as S from "effect/Schema"
 *
 * const value: FieldValue<typeof S.String> = "Ada"
 * console.log(value) // "Ada"
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type FieldValue<T> = T extends S.Top ? S.Codec.Encoded<T> : T;

/**
 * Render-facing state and handlers for a single form field.
 *
 * @example
 * ```ts
 * import type { FieldState } from "@beep/form/core/FieldState"
 * import * as O from "effect/Option"
 *
 * const field: FieldState<string> = {
 *   value: "Ada",
 *   error: O.none(),
 *   isDirty: false,
 *   isTouched: false,
 *   isValidating: false,
 *   onBlur: () => {},
 *   onChange: console.log,
 *   path: "name"
 * }
 * console.log(field.path) // "name"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface FieldState<E> {
  readonly error: O.Option<string>;
  readonly isDirty: boolean;
  readonly isTouched: boolean;
  readonly isValidating: boolean;
  readonly onBlur: () => void;
  readonly onChange: (value: E) => void;
  readonly path: string;
  readonly value: E;
}

/**
 * Render-facing operations for array fields.
 *
 * @example
 * ```ts
 * import type { ArrayFieldOperations } from "@beep/form/core/FieldState"
 *
 * const items: ArrayFieldOperations<string>["items"] = ["A"]
 * console.log(items.length) // 1
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface ArrayFieldOperations<TItem> {
  readonly append: (value?: TItem) => void;
  readonly items: ReadonlyArray<TItem>;
  readonly move: {
    (from: number, to: number): void;
    (to: number): (from: number) => void;
  };
  readonly remove: (index: number) => void;
  readonly swap: {
    (indexA: number, indexB: number): void;
    (indexB: number): (indexA: number) => void;
  };
}
