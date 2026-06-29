/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/Collaboration/Collaboration.model");

/**
 *
 * @example
 * ```ts
 * import { Collaboration } from "@beep/box/experimental/domain/entities/Collaboration/Collaboration.model";
 *
 * console.log(Collaboration.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Collaboration extends S.Class<Collaboration>($I`Collaboration`)(
  {},
  $I.annote("Collaboration", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link Collaboration}
 *
 * @since 0.0.0
 */
export declare namespace Collaboration {
  /**
   * Companion encoded type for {@link Collaboration}.
   *
   * @example
   * ```ts
   * import type { Collaboration } from "@beep/box/experimental/domain/entities/Collaboration/Collaboration.model";
   *
   * const useEncoded = (_value: Collaboration.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof Collaboration.Encoded;
}

/**
 * Companion runtime type for {@link Collaboration}.
 *
 * @example
 * ```ts
 * import type { Collaboration } from "@beep/box/experimental/domain/entities/Collaboration/Collaboration.model";
 *
 * const useValue = (_value: Collaboration) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Collaboration = typeof Collaboration.Type;
