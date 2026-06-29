/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/Outcome/Outcome.model");

/**
 *
 * @example
 * ```ts
 * import { Outcome } from "@beep/box/experimental/domain/entities/Outcome/Outcome.model";
 *
 * console.log(Outcome.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Outcome extends S.Class<Outcome>($I`Outcome`)(
  {},
  $I.annote("Outcome", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link Outcome}
 *
 * @since 0.0.0
 */
export declare namespace Outcome {
  /**
   * Companion encoded type for {@link Outcome}.
   *
   * @example
   * ```ts
   * import type { Outcome } from "@beep/box/experimental/domain/entities/Outcome/Outcome.model";
   *
   * const useEncoded = (_value: Outcome.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof Outcome.Encoded;
}

/**
 * Companion runtime type for {@link Outcome}.
 *
 * @example
 * ```ts
 * import type { Outcome } from "@beep/box/experimental/domain/entities/Outcome/Outcome.model";
 *
 * const useValue = (_value: Outcome) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Outcome = typeof Outcome.Type;
