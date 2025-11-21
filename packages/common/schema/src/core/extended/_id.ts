import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/modules";

/**
 * Identity helper for core extended schema builders.
 *
 * Guarantees Struct/Array/Tuple annotations derive from a stable namespace.
 *
 * @example
 * import { Id } from "@beep/schema/core/extended/_id";
 *
 * const meta = Id.annotations("Struct", { title: "Struct" });
 *
 * @category Core/Extended
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/core/extended`);
