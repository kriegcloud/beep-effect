/**
 * @since 1.0.0
 */

import { $WrapId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $WrapId.create("client-error");
/**
 * @since 1.0.0
 * @category Symbols
 */
export const TypeId: unique symbol = Symbol.for($I`WrapperClientError`);

/**
 * @since 1.0.0
 * @category Symbols
 */
export type TypeId = typeof TypeId;

/**
 * @since 1.0.0
 * @category Errors
 */
export class WrapperClientError extends S.TaggedError<WrapperClientError>($I`WrapperClientError`)(
  "WrapperClientError",
  {
    reason: S.Literal("Protocol", "Unknown"),
    message: S.String,
    cause: S.optional(S.Defect),
  }
) {
  /**
   * @since 1.0.0
   */
  readonly [TypeId]: TypeId = TypeId;
}
