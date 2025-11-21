import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/packages";

/**
 * Identity helper for schema annotation modules.
 *
 * Use this builder instead of `Symbol.for` when creating new annotation IDs.
 *
 * @example
 * import { Id } from "@beep/schema/core/annotations/_id";
 *
 * const Annotation = Id.compose("Example").symbol();
 *
 * @category Core/Annotations
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/core/annotations`);
