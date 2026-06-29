/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/WebLink/WebLink.model");

/**
 *
 * @example
 * ```ts
 * import { WebLink } from "@beep/box/experimental/domain/entities/WebLink/WebLink.model";
 *
 * console.log(WebLink.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class WebLink extends S.Class<WebLink>($I`WebLink`)(
  {},
  $I.annote("WebLink", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link WebLink}
 *
 * @since 0.0.0
 */
export declare namespace WebLink {
  /**
   * Companion encoded type for {@link WebLink}.
   *
   * @example
   * ```ts
   * import type { WebLink } from "@beep/box/experimental/domain/entities/WebLink/WebLink.model";
   *
   * const useEncoded = (_value: WebLink.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof WebLink.Encoded;
}

/**
 * Companion runtime type for {@link WebLink}.
 *
 * @example
 * ```ts
 * import type { WebLink } from "@beep/box/experimental/domain/entities/WebLink/WebLink.model";
 *
 * const useValue = (_value: WebLink) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type WebLink = typeof WebLink.Type;
