/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/Invite/Invite.model");

/**
 *
 * @example
 * ```ts
 * import { Invite } from "@beep/box/experimental/domain/entities/Invite/Invite.model";
 *
 * console.log(Invite.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Invite extends S.Class<Invite>($I`Invite`)(
  {},
  $I.annote("Invite", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link Invite}
 *
 * @since 0.0.0
 */
export declare namespace Invite {
  /**
   * Companion encoded type for {@link Invite}.
   *
   * @example
   * ```ts
   * import type { Invite } from "@beep/box/experimental/domain/entities/Invite/Invite.model";
   *
   * const useEncoded = (_value: Invite.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof Invite.Encoded;
}

/**
 * Companion runtime type for {@link Invite}.
 *
 * @example
 * ```ts
 * import type { Invite } from "@beep/box/experimental/domain/entities/Invite/Invite.model";
 *
 * const useValue = (_value: Invite) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Invite = typeof Invite.Type;
