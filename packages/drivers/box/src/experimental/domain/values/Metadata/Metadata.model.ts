/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";


const $I = $BoxId.create("entities/Metadata/Metadata.model");

/**
 *
 * @example
 * ```ts
 * import { Metadata } from "@beep/box/experimental/domain/values/Metadata/Metadata.model";
 *
 * console.log(Metadata.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Metadata extends S.Class<Metadata>($I`Metadata`)(
  {},
  $I.annote("Metadata", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link Metadata}
 *
 * @since 0.0.0
 */
export declare namespace Metadata {
  /**
   * Companion encoded type for {@link Metadata}.
   *
   * @example
   * ```ts
   * import {Metadata} from "@beep/box/experimental/domain/values/Metadata/Metadata.model";
   *
   * const thing: Metadata.Encoded = S.encodeUnknownSync(Metadata)({});
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof Metadata.Encoded;
}

/**
 * Companion runtime type for {@link Metadata}.
 *
 * @example
 * ```ts
 * import {Metadata} from "@beep/box/experimental/domain/values/Metadata/Metadata.model";
 *
 * const thing: Metadata = S.encodeUnknownSync(Metadata)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Metadata = typeof Metadata.Type;
