/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/TrashFolder/TrashFolder.model");

/**
 *
 * @example
 * ```ts
 * import { TrashFolder } from "@beep/box/experimental/domain/entities/TrashFolder/TrashFolder.model";
 *
 * console.log(TrashFolder.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrashFolder extends S.Class<TrashFolder>($I`TrashFolder`)(
  {},
  $I.annote("TrashFolder", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link TrashFolder}
 *
 * @since 0.0.0
 */
export declare namespace TrashFolder {
  /**
   * Companion encoded type for {@link TrashFolder}.
   *
   * @example
   * ```ts
   * import type { TrashFolder } from "@beep/box/experimental/domain/entities/TrashFolder/TrashFolder.model";
   *
   * const useEncoded = (_value: TrashFolder.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof TrashFolder.Encoded;
}

/**
 * Companion runtime type for {@link TrashFolder}.
 *
 * @example
 * ```ts
 * import type { TrashFolder } from "@beep/box/experimental/domain/entities/TrashFolder/TrashFolder.model";
 *
 * const useValue = (_value: TrashFolder) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type TrashFolder = typeof TrashFolder.Type;
