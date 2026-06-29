/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/StoragePolicy/StoragePolicy.model");

/**
 *
 * @example
 * ```ts
 * import { StoragePolicy } from "@beep/box/experimental/domain/entities/StoragePolicy/StoragePolicy.model";
 *
 * console.log(StoragePolicy.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class StoragePolicy extends S.Class<StoragePolicy>($I`StoragePolicy`)(
  {},
  $I.annote("StoragePolicy", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link StoragePolicy}
 *
 * @since 0.0.0
 */
export declare namespace StoragePolicy {
  /**
   * Companion encoded type for {@link StoragePolicy}.
   *
   * @example
   * ```ts
   * import type { StoragePolicy } from "@beep/box/experimental/domain/entities/StoragePolicy/StoragePolicy.model";
   *
   * const useEncoded = (_value: StoragePolicy.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof StoragePolicy.Encoded;
}

/**
 * Companion runtime type for {@link StoragePolicy}.
 *
 * @example
 * ```ts
 * import type { StoragePolicy } from "@beep/box/experimental/domain/entities/StoragePolicy/StoragePolicy.model";
 *
 * const useValue = (_value: StoragePolicy) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type StoragePolicy = typeof StoragePolicy.Type;
