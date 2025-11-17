import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for temporal primitives such as DateTime or Duration.
 *
 * Ensures all temporal annotations use a unified namespace.
 *
 * @example
 * import { Id } from "@beep/schema-v2/primitives/temporal/_id";
 *
 * const meta = Id.annotations("DateTime", { title: "DateTime" });
 *
 * @category Primitives/Temporal
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/temporal`);
