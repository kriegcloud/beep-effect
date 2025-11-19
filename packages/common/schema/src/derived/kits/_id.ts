import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for derived kit builders.
 *
 * Provides consistent annotation prefixes for kit exports.
 *
 * @example
 * import { Id } from "@beep/schema/derived/kits/_id";
 *
 * const meta = Id.annotations("Kit", { title: "Kit" });
 *
 * @category Derived/Kits
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/derived/kits`);
