/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/DevicePinner/DevicePinner.model");

/**
 *
 * @example
 * ```ts
 * import { DevicePinner } from "@beep/box/experimental/domain/entities/DevicePinner/DevicePinner";
 *
 * console.log(DevicePinner.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DevicePinner extends S.Class<DevicePinner>($I`DevicePinner`)(
  {},
  $I.annote("DevicePinner", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link DevicePinner}
 *
 * @since 0.0.0
 */
export declare namespace DevicePinner {
  /**
   * Companion encoded type for {@link DevicePinner}.
   *
   * @example
   * ```ts
   * import type { DevicePinner } from "@beep/box/experimental/domain/entities/DevicePinner/DevicePinner";
   *
   * const useEncoded = (_value: DevicePinner.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof DevicePinner.Encoded;
}

/**
 * Companion runtime type for {@link DevicePinner}.
 *
 * @example
 * ```ts
 * import type { DevicePinner } from "@beep/box/experimental/domain/entities/DevicePinner/DevicePinner";
 *
 * const useValue = (_value: DevicePinner) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type DevicePinner = typeof DevicePinner.Type;
