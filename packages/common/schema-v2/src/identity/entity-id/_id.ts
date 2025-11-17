import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for entity id schemas.
 *
 * Ensures IDs generated for entity references reuse a stable namespace across docs.
 *
 * @example
 * import { Id } from "@beep/schema-v2/identity/entity-id/_id";
 *
 * const EntityIdAnnotation = Id.compose("Person").symbol();
 *
 * @category Identity/EntityId
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/identity/entity-id`);
