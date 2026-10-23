/**
 * Typed errors raised by {@link LiteralKit} construction, derivation and
 * dispatch.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("LiteralKit/LiteralKit.errors");

const LiteralValueSchema = S.Union([S.String, S.BigInt, S.Boolean, S.Finite]);

/**
 * Error thrown when `LiteralKit.toTaggedUnion` receives a literal that cannot
 * act as an object property key.
 *
 * **Example** (Create tagged-union literal error)
 *
 * ```ts import.meta.vitest name="Create tagged-union literal error"
 * import { LiteralKitTaggedUnionLiteralError } from "@beep/schema/LiteralKit"
 *
 * const error = LiteralKitTaggedUnionLiteralError.make({
 *   literal: BigInt(1)
 * })
 * typeof error.literal // => "bigint"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class LiteralKitTaggedUnionLiteralError extends S.TaggedError<
  LiteralKitTaggedUnionLiteralError,
  { readonly brand: unique symbol }
>($I.make("LiteralKitTaggedUnionLiteralError"))(
  "LiteralKitTaggedUnionLiteralError",
  {
    literal: LiteralValueSchema,
  },
  $I.annoteError<LiteralKitTaggedUnionLiteralError>("LiteralKitTaggedUnionLiteralError", {
    title: "LiteralKit Tagged Union Literal Error",
    description: "LiteralKit.toTaggedUnion only supports literals that can be used as object property keys.",
  })
) {}

/**
 * Error thrown when two literals passed to {@link LiteralKit} derive the same
 * helper key via {@link LiteralToKey}.
 *
 * **Details**
 *
 * Distinct literals such as `1` and `"number1"` would make one `Enum`, `is`,
 * and `match` entry overwrite the other while the schema still accepts both
 * values, so the constructor throws this error instead. A repeated identical
 * literal derives the same key for the same value and is allowed.
 *
 * **Example** (Create key collision error)
 *
 * ```ts import.meta.vitest name="Create key collision error"
 * import { LiteralKitKeyCollisionError } from "@beep/schema/LiteralKit"
 *
 * const error = LiteralKitKeyCollisionError.make({
 *   key: "number1",
 *   existing: 1,
 *   incoming: "number1"
 * })
 * error.key // => "number1"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class LiteralKitKeyCollisionError extends S.TaggedError<
  LiteralKitKeyCollisionError,
  { readonly brand: unique symbol }
>($I.make("LiteralKitKeyCollisionError"))(
  "LiteralKitKeyCollisionError",
  {
    key: S.String,
    existing: LiteralValueSchema,
    incoming: LiteralValueSchema,
  },
  $I.annoteError<LiteralKitKeyCollisionError>("LiteralKitKeyCollisionError", {
    title: "LiteralKit Key Collision Error",
    description: "Two distinct LiteralKit literals derived the same helper key.",
  })
) {}

/**
 * Error thrown when `match` or `matchOrElse` dispatches a value no case
 * handles.
 *
 * **Details**
 *
 * Well-typed callers never see it: `match` requires every member and
 * `matchOrElse` routes the remainder to its fallback. It fires only when a
 * cast or an out-of-domain runtime value reaches the dispatcher, and it names
 * the value, its helper key and the kit's members so the miss can be read
 * without a debugger. The lookup is an own-property check, so a value such as
 * `"toString"` never resolves to a prototype method.
 *
 * **Example** (Create unhandled case error)
 *
 * ```ts import.meta.vitest name="Create unhandled case error"
 * import { LiteralKitUnhandledCaseError } from "@beep/schema/LiteralKit"
 *
 * const error = LiteralKitUnhandledCaseError.make({
 *   key: "archived",
 *   value: "archived",
 *   literals: ["ready", "blocked"]
 * })
 * error.literals.length // => 2
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class LiteralKitUnhandledCaseError extends S.TaggedError<
  LiteralKitUnhandledCaseError,
  { readonly brand: unique symbol }
>($I.make("LiteralKitUnhandledCaseError"))(
  "LiteralKitUnhandledCaseError",
  {
    key: S.String,
    value: LiteralValueSchema,
    literals: S.Array(LiteralValueSchema),
  },
  $I.annoteError<LiteralKitUnhandledCaseError>("LiteralKitUnhandledCaseError", {
    title: "LiteralKit Unhandled Case Error",
    description: "A LiteralKit match received a value that no case handles.",
  })
) {}

/**
 * Error thrown when `omit` would leave a kit with no members.
 *
 * **Details**
 *
 * The type of `omit` already rejects a call that drops every member, so this
 * is a defect guard for callers that widened the argument past the checker.
 *
 * **Example** (Create empty complement error)
 *
 * ```ts import.meta.vitest name="Create empty complement error"
 * import { LiteralKitEmptyComplementError } from "@beep/schema/LiteralKit"
 *
 * const error = LiteralKitEmptyComplementError.make({
 *   literals: ["ready"],
 *   dropped: ["ready"]
 * })
 * error.dropped // => ["ready"]
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class LiteralKitEmptyComplementError extends S.TaggedError<
  LiteralKitEmptyComplementError,
  { readonly brand: unique symbol }
>($I.make("LiteralKitEmptyComplementError"))(
  "LiteralKitEmptyComplementError",
  {
    literals: S.Array(LiteralValueSchema),
    dropped: S.Array(LiteralValueSchema),
  },
  $I.annoteError<LiteralKitEmptyComplementError>("LiteralKitEmptyComplementError", {
    title: "LiteralKit Empty Complement Error",
    description: "LiteralKit.omit dropped every member of the kit.",
  })
) {}
