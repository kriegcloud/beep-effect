/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/ZipDownload/ZipDownload.model");

/**
 *
 * @example
 * ```ts
 * import { ZipDownload } from "@beep/box/experimental/domain/entities/ZipDownload/ZipDownload.model";
 *
 * console.log(ZipDownload.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ZipDownload extends S.Class<ZipDownload>($I`ZipDownload`)(
  {},
  $I.annote("ZipDownload", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link ZipDownload}
 *
 * @since 0.0.0
 */
export declare namespace ZipDownload {
  /**
   * Companion encoded type for {@link ZipDownload}.
   *
   * @example
   * ```ts
   * import type { ZipDownload } from "@beep/box/experimental/domain/entities/ZipDownload/ZipDownload.model";
   *
   * const useEncoded = (_value: ZipDownload.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof ZipDownload.Encoded;
}

/**
 * Companion runtime type for {@link ZipDownload}.
 *
 * @example
 * ```ts
 * import type { ZipDownload } from "@beep/box/experimental/domain/entities/ZipDownload/ZipDownload.model";
 *
 * const useValue = (_value: ZipDownload) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type ZipDownload = typeof ZipDownload.Type;
