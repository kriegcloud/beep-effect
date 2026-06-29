/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";

const $I = $BoxId.create("errors/ClientError.errors");

/**
 * TODO
 *
 * @example
 * ```ts
 * import { PLACEHOLDER } from "@beep/box/experimental/domain/errors/ClientError.errors";
 *
 * console.log(PLACEHOLDER);
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class PLACEHOLDER extends TaggedErrorClass<PLACEHOLDER>($I`PLACEHOLDER`)(
  "PLACEHOLDER",
  {},
  $I.annote("PLACEHOLDER", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link PLACEHOLDER}
 *
 * @since 0.0.0
 */
export declare namespace PLACEHOLDER {
  /**
   * TODO
   *
   * @example
   * ```ts
   * import type { PLACEHOLDER } from "@beep/box/experimental/domain/errors/ClientError.errors";
   *
   * const useEncoded = (_value: PLACEHOLDER.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category errors
   * @since 0.0.0
   */
  export type Encoded = typeof PLACEHOLDER.Encoded;
}
