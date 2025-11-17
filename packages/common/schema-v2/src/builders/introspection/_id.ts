import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for introspection builder modules.
 *
 * Centralizes annotation prefixes for runtime inspection helpers.
 *
 * @example
 * import { Id } from "@beep/schema-v2/builders/introspection/_id";
 *
 * const Example = Id.compose("Inspector").symbol();
 *
 * @category Builders/Introspection
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/builders/introspection`);
