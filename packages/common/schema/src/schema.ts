/**
 * Entry point that mirrors the legacy `@beep/schema/schema` barrel.
 *
 * Provides a compatibility surface while downstream packages finish migrating to the new namespace structure.
 *
 * @example
 * import {BS }  from "@beep/schema";
 *
 * const { primitives } = SchemaV2.BS;
 *
 * @category Surface
 * @since 0.1.0
 */
export * from "./builders";
export * from "./core";
export * from "./derived";
export { StringLiteralKit } from "./derived/kits/string-literal-kit";
export * from "./identity";
export * from "./integrations";
export * from "./primitives";
