/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/File/File.model");

/**
 *
 * @example
 * ```ts
 * import { File } from "@beep/box/experimental/domain/entities/File/File.model";
 *
 * console.log(File.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class File extends S.Class<File>($I`File`)(
  {},
  $I.annote("File", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link File}
 *
 * @since 0.0.0
 */
export declare namespace File {
  /**
   * Companion encoded type for {@link File}.
   *
   * @example
   * ```ts
   * import type { File } from "@beep/box/experimental/domain/entities/File/File.model";
   *
   * const useEncoded = (_value: File.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof File.Encoded;
}

/**
 * Companion runtime type for {@link File}.
 *
 * @example
 * ```ts
 * import type { File } from "@beep/box/experimental/domain/entities/File/File.model";
 *
 * const useValue = (_value: File) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type File = typeof File.Type;
