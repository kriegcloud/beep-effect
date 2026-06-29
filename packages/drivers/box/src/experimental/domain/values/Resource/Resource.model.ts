/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("values/Resource/Resource.model");

/**
 *
 * @example
 * ```ts
 * import { Resource } from "@beep/box/experimental/domain/values/Resource/Resource.model";
 *
 * console.log(Resource.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Resource extends S.Class<Resource>($I`Resource`)(
  {},
  $I.annote("Resource", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link Resource}
 *
 * @since 0.0.0
 */
export declare namespace Resource {
  /**
   * Companion encoded type for {@link Resource}.
   *
   * @example
   * ```ts
   * import type { Resource } from "@beep/box/experimental/domain/values/Resource/Resource.model";
   *
   * const useEncoded = (_value: Resource.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof Resource.Encoded;
}

/**
 * Companion runtime type for {@link Resource}.
 *
 * @example
 * ```ts
 * import type { Resource } from "@beep/box/experimental/domain/values/Resource/Resource.model";
 *
 * const useValue = (_value: Resource) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Resource = typeof Resource.Type;
