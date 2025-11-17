import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for miscellaneous primitives.
 *
 * Acts as the namespace for values that do not fit other primitive buckets.
 *
 * @example
 * import { Id } from "@beep/schema-v2/primitives/misc/_id";
 *
 * const meta = Id.annotations("Misc", { title: "Misc" });
 *
 * @category Primitives/Misc
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/misc`);
