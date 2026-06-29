/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/TrashFolderRestored/TrashFolderRestored.model");

/**
 *
 * @example
 * ```ts
 * import { TrashFolderRestored } from "@beep/box/experimental/domain/entities/TrashFolderRestored/TrashFolderRestored.model";
 *
 * console.log(TrashFolderRestored.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrashFolderRestored extends S.Class<TrashFolderRestored>($I`TrashFolderRestored`)(
  {},
  $I.annote("TrashFolderRestored", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link TrashFolderRestored}
 *
 * @since 0.0.0
 */
export declare namespace TrashFolderRestored {
  /**
   * Companion encoded type for {@link TrashFolderRestored}.
   *
   * @example
   * ```ts
   * import type { TrashFolderRestored } from "@beep/box/experimental/domain/entities/TrashFolderRestored/TrashFolderRestored.model";
   *
   * const useEncoded = (_value: TrashFolderRestored.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof TrashFolderRestored.Encoded;
}

/**
 * Companion runtime type for {@link TrashFolderRestored}.
 *
 * @example
 * ```ts
 * import type { TrashFolderRestored } from "@beep/box/experimental/domain/entities/TrashFolderRestored/TrashFolderRestored.model";
 *
 * const useValue = (_value: TrashFolderRestored) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type TrashFolderRestored = typeof TrashFolderRestored.Type;
