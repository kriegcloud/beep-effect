/**
 * Annotation helpers, metadata symbols, and shared config contracts.
 *
 * @category Core
 * @since 0.1.0
 * @example
 * import * as Core from "@beep/schema/core";
 *
 * const field = Core.Annotations.BSFieldName;
 */
export * as Annotations from "./annotations";
/**
 * Re-exports annotation helpers for convenience imports.
 *
 * @category Core
 * @since 0.1.0
 */
export * from "./annotations";
/**
 * Extended schema constructors (batched collections, fallible transforms, etc.).
 *
 * @category Core
 * @since 0.1.0
 * @example
 * import * as Core from "@beep/schema/core";
 *
 * const batchedStruct = Core.Extended.Struct({ id: Schema.String });
 */
export * as Extended from "./extended";
/**
 * Re-exports extended schema combinators.
 *
 * @category Core
 * @since 0.1.0
 */
export * from "./extended";
/**
 * Higher-level schema factories for tagged unions and structs.
 *
 * @category Core
 * @since 0.1.0
 * @example
 * import * as Core from "@beep/schema/core";
 *
 * const Tagged = Core.Generics.TaggedStruct("Person", { id: Schema.String })();
 */
export * as Generics from "./generics";
/**
 * Re-exports generic schema builders.
 *
 * @category Core
 * @since 0.1.0
 */
export * from "./generics";
/**
 * Scalar helper types exported at the top-level core namespace.
 *
 * @example
 * import { OptionalWithDefault } from "@beep/schema/core";
 *
 * type Tagged = OptionalWithDefault<"Example">;
 *
 * @category Core
 * @since 0.1.0
 */
export type * from "./types";
/**
 * Miscellaneous schema utilities (arbitraries, brands, defaults).
 *
 * @category Core
 * @since 0.1.0
 * @example
 * import * as Core from "@beep/schema/core";
 *
 * const samples = Core.Utils.makeArbs(Schema.String)("type", 3);
 */
export * as Utils from "./utils";
/**
 * Re-exports core utilities for schema composition.
 *
 * @category Core
 * @since 0.1.0
 */
export * from "./utils";
/**
 * Variance helpers for generics exported via the core namespace.
 *
 * @example
 * import { variance } from "@beep/schema/core";
 *
 * type Tagged<A> = { readonly _A: typeof variance._A };
 *
 * @category Core
 * @since 0.1.0
 */
export * from "./variance";


export * as VariantSchema from "./VariantSchema"