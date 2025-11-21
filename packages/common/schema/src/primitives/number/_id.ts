import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/packages";

/**
 * Identity helper for numeric primitive schemas.
 *
 * Keeps number-based annotations consistent across docs and runtime helpers.
 *
 * @example
 * import { Id } from "@beep/schema/primitives/number/_id";
 *
 * const meta = Id.annotations("Positive", { title: "PositiveNumber" });
 *
 * @category Primitives/Number
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/number`);
