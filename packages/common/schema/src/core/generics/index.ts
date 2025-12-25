/**
 * Core generics namespace re-exports.
 *
 * Pulls together tagged struct and union builders so consumers can import from `@beep/schema/core`.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Generics } from "@beep/schema/core";
 *
 * const schema = Generics.TaggedStruct("Example", { id: S.String })();
 *
 * @category Core/Generics
 * @since 0.1.0
 */

export * as DiscriminatedStruct from "./discriminated-struct";
export * from "./nullish";
export * from "./struct-record";
export * from "./tagged-class";
export * from "./tagged-struct";
/**
 * Tagged union helpers re-export.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Generics } from "@beep/schema/core";
 *
 * const Member = Generics.TaggedUnion("_tag")("Example", { id: S.String });
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export * from "./tagged-union";
/**
 * Tagged union factory re-export.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Generics } from "@beep/schema/core";
 *
 * const factory = new Generics.TaggedUnionFactory("_tag", "Example", { id: S.String });
 * const schema = factory.make({ name: S.String })({});
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export * from "./tagged-union-factory";
/**
 * Tagged union with shared fields re-export.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Generics } from "@beep/schema/core";
 *
 * const Options = Generics.TaggedUnionWith({
 *   tags: ["a", "b", "c"],
 *   fields: { enabled: S.Boolean },
 * });
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export * from "./tagged-union-with";
