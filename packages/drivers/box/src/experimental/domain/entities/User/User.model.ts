/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/User/User.model");

/**
 *
 * @example
 * ```ts
 * import { User } from "@beep/box/experimental/domain/entities/User/User.model";
 *
 * console.log(User.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class User extends S.Class<User>($I`User`)(
  {},
  $I.annote("User", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link User}
 *
 * @since 0.0.0
 */
export declare namespace User {
  /**
   * Companion encoded type for {@link User}.
   *
   * @example
   * ```ts
   * import type { User } from "@beep/box/experimental/domain/entities/User/User.model";
   *
   * const useEncoded = (_value: User.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof User.Encoded;
}

/**
 * Companion runtime type for {@link User}.
 *
 * @example
 * ```ts
 * import type { User } from "@beep/box/experimental/domain/entities/User/User.model";
 *
 * const useValue = (_value: User) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type User = typeof User.Type;
