/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/Group/Group.model");

/**
 *
 * @example
 * ```ts
 * import { Group } from "@beep/box/experimental/domain/entities/Group/Group.model";
 *
 * console.log(Group.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Group extends S.Class<Group>($I`Group`)(
  {},
  $I.annote("Group", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link Group}
 *
 * @since 0.0.0
 */
export declare namespace Group {
  /**
   * Companion encoded type for {@link Group}.
   *
   * @example
   * ```ts
   * import type { Group } from "@beep/box/experimental/domain/entities/Group/Group.model";
   *
   * const useEncoded = (_value: Group.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof Group.Encoded;
}

/**
 * Companion runtime type for {@link Group}.
 *
 * @example
 * ```ts
 * import type { Group } from "@beep/box/experimental/domain/entities/Group/Group.model";
 *
 * const useValue = (_value: Group) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Group = typeof Group.Type;
