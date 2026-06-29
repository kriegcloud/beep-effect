/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/GroupMembership/GroupMembership.model");

/**
 *
 * @example
 * ```ts
 * import { GroupMembership } from "@beep/box/experimental/domain/entities/GroupMembership/GroupMembership.model";
 *
 * console.log(GroupMembership.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GroupMembership extends S.Class<GroupMembership>($I`GroupMembership`)(
  {},
  $I.annote("GroupMembership", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link GroupMembership}
 *
 * @since 0.0.0
 */
export declare namespace GroupMembership {
  /**
   * Companion encoded type for {@link GroupMembership}.
   *
   * @example
   * ```ts
   * import type { GroupMembership } from "@beep/box/experimental/domain/entities/GroupMembership/GroupMembership.model";
   *
   * const useEncoded = (_value: GroupMembership.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof GroupMembership.Encoded;
}

/**
 * Companion runtime type for {@link GroupMembership}.
 *
 * @example
 * ```ts
 * import type { GroupMembership } from "@beep/box/experimental/domain/entities/GroupMembership/GroupMembership.model";
 *
 * const useValue = (_value: GroupMembership) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type GroupMembership = typeof GroupMembership.Type;
