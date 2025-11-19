import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for network primitive schemas.
 *
 * Covering URLs, IPs, and hostnames, this namespace keeps annotations consistent.
 *
 * @example
 * import { Id } from "@beep/schema/primitives/network/_id";
 *
 * const meta = Id.annotations("Url", { title: "Url" });
 *
 * @category Primitives/Network
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/network`);
