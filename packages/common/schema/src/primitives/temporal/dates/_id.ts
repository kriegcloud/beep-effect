import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/modules";

/**
 * Identity helper for temporal date primitives (timestamp, year, date-time, etc.).
 *
 * Namespaces annotations for schemas defined under `primitives/temporal/dates`.
 *
 * @example
 * import { Id } from "@beep/schema/primitives/temporal/dates/_id";
 *
 * const meta = Id.annotations("Timestamp", { description: "ISO timestamp" });
 *
 * @category Primitives/Temporal/Dates
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/temporal/dates`);
