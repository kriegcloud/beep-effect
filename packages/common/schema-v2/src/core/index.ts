/**
 * Annotation helpers, metadata symbols, and shared config contracts.
 *
 * @category Core
 * @since 0.1.0
 * @example
 * import { Core } from "@beep/schema-v2";
 *
 * const field = Core.Annotations.BSFieldName;
 */
export * as Annotations from "./annotations";
/**
 * Extended schema constructors (batched collections, fallible transforms, etc.).
 *
 * @category Core
 * @since 0.1.0
 * @example
 * import { Core } from "@beep/schema-v2";
 *
 * const batchedStruct = Core.Extended.Struct({ id: Schema.String });
 */
export * as Extended from "./extended";
/**
 * Higher-level schema factories for tagged unions and structs.
 *
 * @category Core
 * @since 0.1.0
 * @example
 * import { Core } from "@beep/schema-v2";
 *
 * const Tagged = Core.Generics.TaggedStruct("Person", { id: Schema.String })();
 */
export * as Generics from "./generics";
/**
 * Scalar helper types exported at the top-level core namespace.
 *
 * @example
 * import { OptionalWithDefault } from "@beep/schema-v2/core";
 *
 * type Tagged = OptionalWithDefault<"Example">;
 *
 * @category Core
 * @since 0.1.0
 */
export * from "./types";
/**
 * Miscellaneous schema utilities (arbitraries, brands, defaults).
 *
 * @category Core
 * @since 0.1.0
 * @example
 * import { Core } from "@beep/schema-v2";
 *
 * const samples = Core.Utils.makeArbs(Schema.String)("type", 3);
 */
export * as Utils from "./utils";
/**
 * Variance helpers for generics exported via the core namespace.
 *
 * @example
 * import { variance } from "@beep/schema-v2/core";
 *
 * type Tagged<A> = { readonly _A: typeof variance._A };
 *
 * @category Core
 * @since 0.1.0
 */
export * from "./variance";
