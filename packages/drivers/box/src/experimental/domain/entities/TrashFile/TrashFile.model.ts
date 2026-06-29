/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/TrashFile/TrashFile.model");

/**
 *
 * @example
 * ```ts
 * import { TrashFile } from "@beep/box/experimental/domain/entities/TrashFile/TrashFile.model";
 *
 * console.log(TrashFile.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrashFile extends S.Class<TrashFile>($I`TrashFile`)(
  {},
  $I.annote("TrashFile", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link TrashFile}
 *
 * @since 0.0.0
 */
export declare namespace TrashFile {
  /**
   * Companion encoded type for {@link TrashFile}.
   *
   * @example
   * ```ts
   * import type { TrashFile } from "@beep/box/experimental/domain/entities/TrashFile/TrashFile.model";
   *
   * const useEncoded = (_value: TrashFile.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof TrashFile.Encoded;
}

/**
 * Companion runtime type for {@link TrashFile}.
 *
 * @example
 * ```ts
 * import type { TrashFile } from "@beep/box/experimental/domain/entities/TrashFile/TrashFile.model";
 *
 * const useValue = (_value: TrashFile) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type TrashFile = typeof TrashFile.Type;
