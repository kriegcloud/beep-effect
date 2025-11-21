import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/modules";

/**
 * Identity helper for boolean primitive schemas.
 *
 * Provides deterministic identifiers when annotating boolean helpers.
 *
 * @example
 * import { Id } from "@beep/schema/primitives/bool/_id";
 *
 * const meta = Id.annotations("Boolean", { title: "Boolean" });
 *
 * @category Primitives/Bool
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/bool`);
