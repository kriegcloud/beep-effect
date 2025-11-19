import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for url primitives.
 *
 * Acts as the namespace for values that do not fit other primitive buckets.
 *
 * @example
 * import { Id } from "@beep/schema/primitives/url/_id";
 *
 * const meta = Id.annotations("Url", { title: "Url" });
 *
 * @category Primitives/Url
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/url`);
