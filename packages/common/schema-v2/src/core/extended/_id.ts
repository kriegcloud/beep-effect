import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for core extended schema builders.
 *
 * Guarantees Struct/Array/Tuple annotations derive from a stable namespace.
 *
 * @example
 * import { Id } from "@beep/schema-v2/core/extended/_id";
 *
 * const meta = Id.annotations("Struct", { title: "Struct" });
 *
 * @category Core/Extended
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/core/extended`);
