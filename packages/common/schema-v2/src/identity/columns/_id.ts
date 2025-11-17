import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for column builders tied to identity schemas.
 *
 * Provides annotation namespaces for column metadata exported by schema-v2.
 *
 * @example
 * import { Id } from "@beep/schema-v2/identity/columns/_id";
 *
 * const ColumnAnnotation = Id.compose("Email").symbol();
 *
 * @category Identity/Columns
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/identity/columns`);
