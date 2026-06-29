/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("values/PLACEHOLDER/PLACEHOLDER.model");

/**
 *
 * @example
 * ```ts
 * import { PLACEHOLDER } from "@beep/box/experimental/domain/values/PLACEHOLDER/PLACEHOLDER.model";
 *
 * console.log(PLACEHOLDER.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PLACEHOLDER extends S.Class<PLACEHOLDER>($I`PLACEHOLDER`)(
  {},
  $I.annote("PLACEHOLDER", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link PLACEHOLDER}
 *
 * @since 0.0.0
 */
export declare namespace PLACEHOLDER {
  /**
   * Companion encoded type for {@link PLACEHOLDER}.
   *
   * @example
   * ```ts
   * import type { PLACEHOLDER } from "@beep/box/experimental/domain/values/PLACEHOLDER/PLACEHOLDER.model";
   *
   * const useEncoded = (_value: PLACEHOLDER.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof PLACEHOLDER.Encoded;
}

/**
 * Companion runtime type for {@link PLACEHOLDER}.
 *
 * @example
 * ```ts
 * import type { PLACEHOLDER } from "@beep/box/experimental/domain/values/PLACEHOLDER/PLACEHOLDER.model";
 *
 * const useValue = (_value: PLACEHOLDER) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type PLACEHOLDER = typeof PLACEHOLDER.Type;
