/**
 * Entry point that mirrors the legacy `@beep/schema/schema` barrel.
 *
 * Provides a compatibility surface while downstream packages finish migrating to the new namespace structure.
 *
 * @example
 * import * as SchemaV2 from "@beep/schema-v2/schema";
 *
 * const { primitives } = SchemaV2.BS;
 *
 * @category Surface
 * @since 0.1.0
 */
export * from "./index";
