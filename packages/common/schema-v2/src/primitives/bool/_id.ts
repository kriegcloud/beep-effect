import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for boolean primitive schemas.
 *
 * Provides deterministic identifiers when annotating boolean helpers.
 *
 * @example
 * import { Id } from "@beep/schema-v2/primitives/bool/_id";
 *
 * const meta = Id.annotations("Boolean", { title: "Boolean" });
 *
 * @category Primitives/Bool
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/bool`);
