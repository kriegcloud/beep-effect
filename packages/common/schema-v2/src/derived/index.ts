/**
 * Placeholder namespace for derived kits (collections, literal helpers, etc.).
 *
 * Allows downstream packages to import the namespace ahead of concrete derived exports.
 *
 * @example
 * import type * as DerivedNamespace from "@beep/schema-v2/derived";
 *
 * type DerivedSurface = DerivedNamespace.Placeholder;
 *
 * @category Surface/Derived
 * @since 0.1.0
 * @internal
 */
export type Placeholder = never;
