import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for content-type primitive schemas.
 *
 * Covering MIME types, this namespace keeps annotations consistent.
 *
 * @example
 * import { Id } from "@beep/schema/primitives/content-types/_id";
 *
 * const meta = Id.annotations("Url", { title: "Url" });
 *
 * @category Primitives/Network
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/content-types`);
