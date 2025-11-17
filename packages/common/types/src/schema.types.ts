/**
 * Effect Schema helper aliases for type-only plumbing across packages.
 *
 * @example
 * import type { AnySchema } from "@beep/types/schema.types";
 *
 * let schema!: AnySchema;
 * void schema;
 *
 * @category Types/Schema
 * @since 0.1.0
 */
import type { UnsafeAny } from "@beep/types/unsafe.types";
import type * as S from "effect/Schema";

/**
 * Effect Schema with arbitrary input/output and context types.
 *
 * Useful when piping schemas through helpers that do not care about their
 * concrete shape but still need a strongly typed reference.
 *
 * @example
 * import type { AnySchema } from "@beep/types/schema.types";
 *
 * let schema!: AnySchema;
 * void schema;
 *
 * @category Types/Schema
 * @since 0.1.0
 */
export type AnySchema = S.Schema<UnsafeAny, UnsafeAny, UnsafeAny>;

/**
 * Variant of {@link AnySchema} that omits the context parameter.
 *
 * Use when working with plain schemas (most UI glue) to avoid `never` noise.
 *
 * @example
 * import type { AnySchemaNoContext } from "@beep/types/schema.types";
 *
 * let plain!: AnySchemaNoContext;
 * void plain;
 *
 * @category Types/Schema
 * @since 0.1.0
 */
export type AnySchemaNoContext = S.Schema<UnsafeAny, UnsafeAny>;
