/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("values/UploadPart/UploadPart.model");

/**
 *
 * @example
 * ```ts
 * import { UploadPart } from "@beep/box/experimental/domain/values/UploadPart/UploadPart.model";
 *
 * console.log(UploadPart.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UploadPart extends S.Class<UploadPart>($I`UploadPart`)(
  {},
  $I.annote("UploadPart", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link UploadPart}
 *
 * @since 0.0.0
 */
export declare namespace UploadPart {
  /**
   * Companion encoded type for {@link UploadPart}.
   *
   * @example
   * ```ts
   * import type { UploadPart } from "@beep/box/experimental/domain/values/UploadPart/UploadPart.model";
   *
   * const useEncoded = (_value: UploadPart.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof UploadPart.Encoded;
}

/**
 * Companion runtime type for {@link UploadPart}.
 *
 * @example
 * ```ts
 * import type { UploadPart } from "@beep/box/experimental/domain/values/UploadPart/UploadPart.model";
 *
 * const useValue = (_value: UploadPart) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type UploadPart = typeof UploadPart.Type;
