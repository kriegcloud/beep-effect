/**
 * Placeholder namespace for primitive schemas (strings, numbers, binary, locale, etc.).
 *
 * Maintains a stable import target for primitives while schema-v2 finalizes each bundle.
 *
 * @example
 * import type * as SchemaPrimitives from "@beep/schema-v2/primitives";
 *
 * type PrimitiveSurface = SchemaPrimitives.Placeholder;
 *
 * @category Surface/Primitives
 * @since 0.1.0
 * @internal
 */
export type Placeholder = never;
