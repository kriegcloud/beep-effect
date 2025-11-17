/**
 * Namespace exports for the WithDefaultsThunk helper.
 *
 * Simplifies imports for optional schema defaults throughout schema-v2.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { WithDefaultsThunk } from "@beep/schema-v2/core/utils/with-defaults-thunk";
 *
 * const makeDefault = WithDefaultsThunk.make(S.optional(S.String));
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export * as WithDefaultsThunk from "./with-defaults-thunk";
