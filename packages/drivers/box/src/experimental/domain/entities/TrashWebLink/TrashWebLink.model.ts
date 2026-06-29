/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/TrashWebLink/TrashWebLink.model");

/**
 *
 * @example
 * ```ts
 * import { TrashWebLink } from "@beep/box/experimental/domain/entities/TrashWebLink/TrashWebLink.model";
 *
 * console.log(TrashWebLink.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrashWebLink extends S.Class<TrashWebLink>($I`TrashWebLink`)(
  {},
  $I.annote("TrashWebLink", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link TrashWebLink}
 *
 * @since 0.0.0
 */
export declare namespace TrashWebLink {
  /**
   * Companion encoded type for {@link TrashWebLink}.
   *
   * @example
   * ```ts
   * import type { TrashWebLink } from "@beep/box/experimental/domain/entities/TrashWebLink/TrashWebLink.model";
   *
   * const useEncoded = (_value: TrashWebLink.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof TrashWebLink.Encoded;
}

/**
 * Companion runtime type for {@link TrashWebLink}.
 *
 * @example
 * ```ts
 * import type { TrashWebLink } from "@beep/box/experimental/domain/entities/TrashWebLink/TrashWebLink.model";
 *
 * const useValue = (_value: TrashWebLink) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type TrashWebLink = typeof TrashWebLink.Type;
