/**
 * Placeholder namespace for primitive schemas (strings, numbers, binary, locale, etc.).
 *
 * Maintains a stable import target for primitives while schema finalizes each bundle.
 *
 * @example
 * import type * as SchemaPrimitives from "@beep/schema/primitives";
 *
 * type PrimitiveSurface = SchemaPrimitives.Placeholder;
 *
 * @category Surface/Primitives
 * @since 0.1.0
 *
 */

export * from "./array";
export * from "./array-buffer";
export * from "./binary/uint8-array";
export * from "./bool";
export * from "./content-types";
export * from "./duration";
export * from "./fn";
export * from "./geo";
export * from "./json";
export * from "./locales";
export * from "./network";
export * from "./number";
export * from "./person";
export * from "./regex";
export * from "./string";
export * from "./temporal";
export * from "./url";
