/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("values/Classification/Classification.model");

/**
 *
 * @example
 * ```ts
 * import { Classification } from "@beep/box/experimental/domain/values/Classification/Classification.model";
 *
 * console.log(Classification.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Classification extends S.Class<Classification>($I`Classification`)(
  {},
  $I.annote("Classification", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link Classification}
 *
 * @since 0.0.0
 */
export declare namespace Classification {
  /**
   * Companion encoded type for {@link Classification}.
   *
   * @example
   * ```ts
   * import type { Classification } from "@beep/box/experimental/domain/values/Classification/Classification.model";
   *
   * const useEncoded = (_value: Classification.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof Classification.Encoded;
}

/**
 * Companion runtime type for {@link Classification}.
 *
 * @example
 * ```ts
 * import type { Classification } from "@beep/box/experimental/domain/values/Classification/Classification.model";
 *
 * const useValue = (_value: Classification) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Classification = typeof Classification.Type;
