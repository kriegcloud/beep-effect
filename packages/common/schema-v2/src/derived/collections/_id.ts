import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for derived collection schemas.
 *
 * Use for annotating shared collection utilities and docs.
 *
 * @example
 * import { Id } from "@beep/schema-v2/derived/collections/_id";
 *
 * const meta = Id.annotations("Collection", { title: "Collection" });
 *
 * @category Derived/Collections
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/derived/collections`);
