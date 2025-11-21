import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/modules";

/**
 * Identity helper for miscellaneous primitives.
 *
 * Acts as the namespace for values that do not fit other primitive buckets.
 *
 * @example
 * import { Id } from "@beep/schema/primitives/json/_id";
 *
 * const meta = Id.annotations("Misc", { title: "Json" });
 *
 * @category Primitives/Json
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/json`);
