import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for configuration integration schemas.
 *
 * Use this when annotating config builders to guarantee deterministic identifiers.
 *
 * @example
 * import { Id } from "@beep/schema/integrations/config/_id";
 *
 * const ConfigAnnotation = Id.compose("Env").symbol();
 *
 * @category Integrations/Config
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/integrations/config`);
