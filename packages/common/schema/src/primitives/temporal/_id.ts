import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/packages";

/**
 * Identity helper for temporal primitives such as DateTime or Duration.
 *
 * Ensures all temporal annotations use a unified namespace.
 *
 * @example
 * import { Id } from "@beep/schema/primitives/temporal/_id";
 *
 * const meta = Id.annotations("DateTime", { title: "DateTime" });
 *
 * @category Primitives/Temporal
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/temporal`);
