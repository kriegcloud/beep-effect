import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for location primitives.
 *
 * Provides consistent annotation prefixes for country, locality, street, subdivision, and postal code schemas.
 *
 * @example
 * import { Id } from "@beep/schema-v2/primitives/geo/_id";
 *
 * const meta = Id.annotations("Locality", { description: "City or locality name" });
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/geo`);
