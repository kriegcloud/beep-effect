import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for person-centric primitive schemas (first name, last name, birth date, etc.).
 *
 * Keeps annotations scoped to `primitives/person` so downstream references stay deterministic.
 *
 * @example
 * import { Id } from "@beep/schema-v2/primitives/person/_id";
 *
 * const meta = Id.annotations("PersonName", { title: "Person Name" });
 *
 * @category Primitives/Person
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/person`);
