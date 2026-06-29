/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/FileVersion/FileVersion.model");

/**
 *
 * @example
 * ```ts
 * import { FileVersion } from "@beep/box/experimental/domain/entities/FileVersion/FileVersion.model";
 *
 * console.log(FileVersion.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FileVersion extends S.Class<FileVersion>($I`FileVersion`)(
  {},
  $I.annote("FileVersion", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link FileVersion}
 *
 * @since 0.0.0
 */
export declare namespace FileVersion {
  /**
   * Companion encoded type for {@link FileVersion}.
   *
   * @example
   * ```ts
   * import type { FileVersion } from "@beep/box/experimental/domain/entities/FileVersion/FileVersion.model";
   *
   * const useEncoded = (_value: FileVersion.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof FileVersion.Encoded;
}

/**
 * Companion runtime type for {@link FileVersion}.
 *
 * @example
 * ```ts
 * import type { FileVersion } from "@beep/box/experimental/domain/entities/FileVersion/FileVersion.model";
 *
 * const useValue = (_value: FileVersion) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type FileVersion = typeof FileVersion.Type;
