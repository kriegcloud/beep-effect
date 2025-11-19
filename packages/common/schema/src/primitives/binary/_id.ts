import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for binary primitive schemas.
 *
 * Use when annotating byte/string conversion helpers.
 *
 * @example
 * import { Id } from "@beep/schema/primitives/binary/_id";
 *
 * const meta = Id.annotations("Binary", { title: "Binary" });
 *
 * @category Primitives/Binary
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/binary`);
