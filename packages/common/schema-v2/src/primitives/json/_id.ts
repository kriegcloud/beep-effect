import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for miscellaneous primitives.
 *
 * Acts as the namespace for values that do not fit other primitive buckets.
 *
 * @example
 * import { Id } from "@beep/schema-v2/primitives/json/_id";
 *
 * const meta = Id.annotations("Misc", { title: "Json" });
 *
 * @category Primitives/Json
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/json`);
