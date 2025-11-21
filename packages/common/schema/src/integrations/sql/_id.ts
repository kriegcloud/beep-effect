import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/modules";

/**
 * Identity helper for SQL integration schemas.
 *
 * Enables consistent identifier generation for SQL-related annotation helpers.
 *
 * @example
 * import { Id } from "@beep/schema/integrations/sql/_id";
 *
 * const SqlAnnotation = Id.compose("Table").symbol();
 *
 * @category Integrations/Sql
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/integrations/sql`);
