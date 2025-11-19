import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for HTTP integration schemas.
 *
 * Provides a stable namespace for HTTP-specific annotation metadata.
 *
 * @example
 * import { Id } from "@beep/schema/integrations/http/_id";
 *
 * const HttpAnnotation = Id.compose("Route").symbol();
 *
 * @category Integrations/Http
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/integrations/http`);
