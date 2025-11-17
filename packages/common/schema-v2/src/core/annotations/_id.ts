import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for schema-v2 annotation modules.
 *
 * Use this builder instead of `Symbol.for` when creating new annotation IDs.
 *
 * @example
 * import { Id } from "@beep/schema-v2/core/annotations/_id";
 *
 * const Annotation = Id.compose("Example").symbol();
 *
 * @category Core/Annotations
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/core/annotations`);
