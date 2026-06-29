/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/AppItem/AppItem.model");

/**
 *
 * @example
 * ```ts
 * import { AppItem } from "@beep/box/experimental/domain/entities/AppItem/AppItem.model";
 *
 * console.log(AppItem.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AppItem extends S.Class<AppItem>($I`AppItem`)(
  {},
  $I.annote("AppItem", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link AppItem}
 *
 * @since 0.0.0
 */
export declare namespace AppItem {
  /**
   * Companion encoded type for {@link AppItem}.
   *
   * @example
   * ```ts
   * import type { AppItem } from "@beep/box/experimental/domain/entities/AppItem/AppItem.model";
   *
   * const useEncoded = (_value: AppItem.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof AppItem.Encoded;
}

/**
 * Companion runtime type for {@link AppItem}.
 *
 * @example
 * ```ts
 * import type { AppItem } from "@beep/box/experimental/domain/entities/AppItem/AppItem.model";
 *
 * const useValue = (_value: AppItem) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type AppItem = typeof AppItem.Type;
