import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/packages";

/**
 * Identity helper for the Core Generics namespace.
 *
 * Use this builder to stamp consistent annotation identifiers for tagged structs/unions.
 *
 * @example
 * import { Id } from "@beep/schema/core/generics/_id";
 *
 * const annotations = Id.annotations("TaggedStruct", { title: "TaggedStruct" });
 *
 * @category Core/Generics
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/core/generics`);
