/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/IntegrationMapping/IntegrationMapping.model");

/**
 *
 * @example
 * ```ts
 * import { IntegrationMapping } from "@beep/box/experimental/domain/entities/IntegrationMapping/IntegrationMapping.model";
 *
 * console.log(IntegrationMapping.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class IntegrationMapping extends S.Class<IntegrationMapping>($I`IntegrationMapping`)(
  {},
  $I.annote("IntegrationMapping", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link IntegrationMapping}
 *
 * @since 0.0.0
 */
export declare namespace IntegrationMapping {
  /**
   * Companion encoded type for {@link IntegrationMapping}.
   *
   * @example
   * ```ts
   * import type { IntegrationMapping } from "@beep/box/experimental/domain/entities/IntegrationMapping/IntegrationMapping.model";
   *
   * const useEncoded = (_value: IntegrationMapping.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof IntegrationMapping.Encoded;
}

/**
 * Companion runtime type for {@link IntegrationMapping}.
 *
 * @example
 * ```ts
 * import type { IntegrationMapping } from "@beep/box/experimental/domain/entities/IntegrationMapping/IntegrationMapping.model";
 *
 * const useValue = (_value: IntegrationMapping) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type IntegrationMapping = typeof IntegrationMapping.Type;
