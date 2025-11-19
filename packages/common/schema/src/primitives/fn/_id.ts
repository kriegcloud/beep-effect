import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for schema function primitives.
 *
 * Provides deterministic annotation namespaces for Fn-based helpers under `primitives/fn`.
 *
 * @example
 * import { Id } from "@beep/schema/primitives/fn/_id";
 *
 * const meta = Id.annotations("Fn", { description: "Function schema" });
 *
 * @category Primitives/Fn
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/fn`);
