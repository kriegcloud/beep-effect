import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for the Core Generics namespace.
 *
 * Use this builder to stamp consistent annotation identifiers for tagged structs/unions.
 *
 * @example
 * import { Id } from "@beep/schema-v2/core/generics/_id";
 *
 * const annotations = Id.annotations("TaggedStruct", { title: "TaggedStruct" });
 *
 * @category Core/Generics
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/core/generics`);
