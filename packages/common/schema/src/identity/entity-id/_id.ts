import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/modules";

/**
 * Identity helper for entity id schemas.
 *
 * Ensures IDs generated for entity references reuse a stable namespace across docs.
 *
 * @example
 * import { Id } from "@beep/schema/identity/entity-id/_id";
 *
 * const EntityIdAnnotation = Id.compose("Person").symbol();
 *
 * @category Identity/EntityId
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/identity/entity-id`);
