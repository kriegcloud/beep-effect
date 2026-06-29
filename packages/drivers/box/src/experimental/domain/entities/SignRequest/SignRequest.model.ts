/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/SignRequest/SignRequest.model");

/**
 *
 * @example
 * ```ts
 * import { SignRequest } from "@beep/box/experimental/domain/entities/SignRequest/SignRequest.model";
 *
 * console.log(SignRequest.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SignRequest extends S.Class<SignRequest>($I`SignRequest`)(
  {},
  $I.annote("SignRequest", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link SignRequest}
 *
 * @since 0.0.0
 */
export declare namespace SignRequest {
  /**
   * Companion encoded type for {@link SignRequest}.
   *
   * @example
   * ```ts
   * import type { SignRequest } from "@beep/box/experimental/domain/entities/SignRequest/SignRequest.model";
   *
   * const useEncoded = (_value: SignRequest.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof SignRequest.Encoded;
}

/**
 * Companion runtime type for {@link SignRequest}.
 *
 * @example
 * ```ts
 * import type { SignRequest } from "@beep/box/experimental/domain/entities/SignRequest/SignRequest.model";
 *
 * const useValue = (_value: SignRequest) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type SignRequest = typeof SignRequest.Type;
