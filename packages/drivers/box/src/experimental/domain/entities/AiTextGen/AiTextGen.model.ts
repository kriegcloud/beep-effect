/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/AiTextGen/AiTextGen.model");

/**
 *
 * @example
 * ```ts
 * import { AiTextGen } from "@beep/box/experimental/domain/entities/AiTextGen/AiTextGen.model";
 *
 * console.log(AiTextGen.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AiTextGen extends S.Class<AiTextGen>($I`AiTextGen`)(
  {},
  $I.annote("AiTextGen", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link AiTextGen}
 *
 * @since 0.0.0
 */
export declare namespace AiTextGen {
  /**
   * Companion encoded type for {@link AiTextGen}.
   *
   * @example
   * ```ts
   * import type { AiTextGen } from "@beep/box/experimental/domain/entities/AiTextGen/AiTextGen.model";
   *
   * const useEncoded = (_value: AiTextGen.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof AiTextGen.Encoded;
}

/**
 * Companion runtime type for {@link AiTextGen}.
 *
 * @example
 * ```ts
 * import type { AiTextGen } from "@beep/box/experimental/domain/entities/AiTextGen/AiTextGen.model";
 *
 * const useValue = (_value: AiTextGen) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type AiTextGen = typeof AiTextGen.Type;
