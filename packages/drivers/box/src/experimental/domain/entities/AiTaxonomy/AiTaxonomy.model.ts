/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/AiTaxonomy/AiTaxonomy.model");

/**
 *
 * @example
 * ```ts
 * import { AiTaxonomy } from "@beep/box/experimental/domain/entities/AiTaxonomy/AiTaxonomy.model";
 *
 * console.log(AiTaxonomy.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AiTaxonomy extends S.Class<AiTaxonomy>($I`AiTaxonomy`)(
  {},
  $I.annote("AiTaxonomy", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link AiTaxonomy}
 *
 * @since 0.0.0
 */
export declare namespace AiTaxonomy {
  /**
   * Companion encoded type for {@link AiTaxonomy}.
   *
   * @example
   * ```ts
   * import type { AiTaxonomy } from "@beep/box/experimental/domain/entities/AiTaxonomy/AiTaxonomy.model";
   *
   * const useEncoded = (_value: AiTaxonomy.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof AiTaxonomy.Encoded;
}

/**
 * Companion runtime type for {@link AiTaxonomy}.
 *
 * @example
 * ```ts
 * import type { AiTaxonomy } from "@beep/box/experimental/domain/entities/AiTaxonomy/AiTaxonomy.model";
 *
 * const useValue = (_value: AiTaxonomy) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type AiTaxonomy = typeof AiTaxonomy.Type;
