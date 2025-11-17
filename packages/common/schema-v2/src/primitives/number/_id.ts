import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for numeric primitive schemas.
 *
 * Keeps number-based annotations consistent across docs and runtime helpers.
 *
 * @example
 * import { Id } from "@beep/schema-v2/primitives/number/_id";
 *
 * const meta = Id.annotations("Positive", { title: "PositiveNumber" });
 *
 * @category Primitives/Number
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/number`);
