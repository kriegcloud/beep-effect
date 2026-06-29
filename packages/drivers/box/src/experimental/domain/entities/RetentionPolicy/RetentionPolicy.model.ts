/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/RetentionPolicy/RetentionPolicy.model");

/**
 *
 * @example
 * ```ts
 * import { RetentionPolicy } from "@beep/box/experimental/domain/entities/RetentionPolicy/RetentionPolicy.model";
 *
 * console.log(RetentionPolicy.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RetentionPolicy extends S.Class<RetentionPolicy>($I`RetentionPolicy`)(
  {},
  $I.annote("RetentionPolicy", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link RetentionPolicy}
 *
 * @since 0.0.0
 */
export declare namespace RetentionPolicy {
  /**
   * Companion encoded type for {@link RetentionPolicy}.
   *
   * @example
   * ```ts
   * import type { RetentionPolicy } from "@beep/box/experimental/domain/entities/RetentionPolicy/RetentionPolicy.model";
   *
   * const useEncoded = (_value: RetentionPolicy.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof RetentionPolicy.Encoded;
}

/**
 * Companion runtime type for {@link RetentionPolicy}.
 *
 * @example
 * ```ts
 * import type { RetentionPolicy } from "@beep/box/experimental/domain/entities/RetentionPolicy/RetentionPolicy.model";
 *
 * const useValue = (_value: RetentionPolicy) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type RetentionPolicy = typeof RetentionPolicy.Type;
