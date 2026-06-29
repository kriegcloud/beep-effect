/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/TrashFileRestored/TrashFileRestored.model");

/**
 *
 * @example
 * ```ts
 * import { TrashFileRestored } from "@beep/box/experimental/domain/entities/TrashFileRestored/TrashFileRestored.model";
 *
 * console.log(TrashFileRestored.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrashFileRestored extends S.Class<TrashFileRestored>($I`TrashFileRestored`)(
  {},
  $I.annote("TrashFileRestored", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link TrashFileRestored}
 *
 * @since 0.0.0
 */
export declare namespace TrashFileRestored {
  /**
   * Companion encoded type for {@link TrashFileRestored}.
   *
   * @example
   * ```ts
   * import type { TrashFileRestored } from "@beep/box/experimental/domain/entities/TrashFileRestored/TrashFileRestored.model";
   *
   * const useEncoded = (_value: TrashFileRestored.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof TrashFileRestored.Encoded;
}

/**
 * Companion runtime type for {@link TrashFileRestored}.
 *
 * @example
 * ```ts
 * import type { TrashFileRestored } from "@beep/box/experimental/domain/entities/TrashFileRestored/TrashFileRestored.model";
 *
 * const useValue = (_value: TrashFileRestored) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type TrashFileRestored = typeof TrashFileRestored.Type;
