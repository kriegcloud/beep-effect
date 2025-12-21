/**
 * @fileoverview Compile-time type utilities for Effect-based codebases.
 *
 * This package provides a comprehensive collection of TypeScript type utilities
 * organized into focused namespaces. These utilities support type-level
 * programming patterns common in Effect applications, including:
 * - String manipulation and validation
 * - Record and struct transformations
 * - Schema field constraints
 * - Case transformations (snake_case ↔ PascalCase)
 * - Type guards and refinements
 *
 * @since 0.1.0
 */

/**
 * Re-exports built-in type utilities for recursive transformations.
 *
 * @example
 * ```typescript
 * import type { Builtin } from "@beep/types"
 *
 * type DeepTransform<T> = T extends Builtin
 *   ? T
 *   : { [K in keyof T]: DeepTransform<T[K]> }
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * from "./built-in.types.ts";

/**
 * Re-exports character literal types for template string helpers.
 *
 * @example
 * ```typescript
 * import type { UpperLetter } from "@beep/types"
 *
 * type Flag = `${UpperLetter}_${UpperLetter}`
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * from "./char.types.ts";

/**
 * Re-exports common utility types for intersection flattening and deep partials.
 *
 * @example
 * ```typescript
 * import type { Prettify } from "@beep/types"
 *
 * type Clean = Prettify<{ a: 1 } & { b: 2 }>
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * from "./common.types.js";

/**
 * Re-exports deep non-nullable transformation utilities.
 *
 * @example
 * ```typescript
 * import type { DeepNonNullable } from "@beep/types"
 *
 * type Strict = DeepNonNullable<{ a?: string | null }>
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * from "./deep-non-nullable.types.ts";

/**
 * Function type utilities for guards and refinements.
 *
 * @example
 * ```typescript
 * import type { FnTypes } from "@beep/types"
 *
 * type IsString = FnTypes.Guard<unknown, string>
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * as FnTypes from "./fn.types.js";

/**
 * Literal character types and case transformation utilities.
 *
 * @example
 * ```typescript
 * import type { LiteralTypes } from "@beep/types"
 *
 * type Pascal = LiteralTypes.CaseTransform.SnakeToPascal<"user_session">
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * as LiteralTypes from "./literal.types.js";

/**
 * Variant Schema model field utilities for non-empty constraints.
 *
 * @example
 * ```typescript
 * import type { ModelTypes } from "@beep/types"
 * import type { Field } from "@effect/experimental/VariantSchema"
 *
 * type Fields = ModelTypes.NonEmptyModelFields<{ id: Field.Any }>
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * as ModelTypes from "./model.types.js";

/**
 * Mutability transformation utilities for removing readonly modifiers.
 *
 * @example
 * ```typescript
 * import type { MutTypes } from "@beep/types"
 *
 * type Editable = MutTypes.Mutable<{ readonly id: string }>
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * as MutTypes from "./mut.types.js";

/**
 * Union type helpers for adding null or undefined.
 *
 * @example
 * ```typescript
 * import type { Or } from "@beep/types"
 *
 * type MaybeString = Or.Undefined<string>
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * as Or from "./or.types.js";

/**
 * Re-exports primitive type definitions.
 *
 * @example
 * ```typescript
 * import type { PrimitiveTypes } from "@beep/types"
 *
 * type Value = PrimitiveTypes
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * from "./primitive.types.ts";

/**
 * Promise-related type utilities for async value handling.
 *
 * @example
 * ```typescript
 * import type { PromiseTypes } from "@beep/types"
 *
 * type MaybeAsync = PromiseTypes.Awaitable<number>
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * as PromiseTypes from "./promise.types.js";

/**
 * Record transformation utilities for non-empty string-keyed dictionaries.
 *
 * @example
 * ```typescript
 * import type { RecordTypes } from "@beep/types"
 *
 * type Safe = RecordTypes.NonEmptyReadonlyRecord<{ id: string }>
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * as RecordTypes from "./record.types.js";

/**
 * Effect Schema helper aliases for type-only schema references.
 *
 * @example
 * ```typescript
 * import type { SchemaTypes } from "@beep/types"
 *
 * type AnyValidator = SchemaTypes.AnySchema
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * as SchemaTypes from "./schema.types.js";

/**
 * String literal utilities for non-empty and case-sensitive constraints.
 *
 * @example
 * ```typescript
 * import type { StringTypes } from "@beep/types"
 *
 * type Slug = StringTypes.LowercaseNonEmptyString<"user">
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * as StringTypes from "./string.types.js";

/**
 * Effect Schema struct field utilities for non-empty validation.
 *
 * @example
 * ```typescript
 * import type { StructTypes } from "@beep/types"
 * import * as S from "effect/Schema"
 *
 * type Fields = StructTypes.NonEmptyStructFields<{ id: S.Struct.Field }>
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * as StructTypes from "./struct.types.js";

/**
 * Template literal helpers for snake_case tag validation.
 *
 * @example
 * ```typescript
 * import type { TagTypes } from "@beep/types"
 *
 * type EntityTag = TagTypes.SnakeTag<"user_session">
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * as TagTypes from "./tag.types.js";
export * from "./thunk.types.ts";
/**
 * Escape-hatch type aliases for unsafe any-based and safe unknown-based types.
 *
 * @example
 * ```typescript
 * import type { UnsafeTypes } from "@beep/types"
 *
 * type SafeBlob = UnsafeTypes.UnknownRecord
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * as UnsafeTypes from "./unsafe.types.js";
/**
 * General-purpose utility types for non-empty strings and struct field maps.
 *
 * @example
 * ```typescript
 * import type { UtilTypes } from "@beep/types"
 * import * as S from "effect/Schema"
 *
 * type Fields = UtilTypes.NonEmptyStructFieldMap<{ id: S.Struct.Field }>
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export type * as UtilTypes from "./util.types.js";
