/**
 * Optional schema helpers with thunked defaults.
 *
 * Provides builder functions that wrap schemas with `withDefaults` metadata.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { toOptionalWithDefault } from "@beep/schema/core/utils/to-optional-with";
 *
 * const optionalString = toOptionalWithDefault(S.String)("fallback");
 *
 * @category Core/Utils
 * @since 0.1.0
 */
import * as S from "effect/Schema";
import { WithDefaultsThunk } from "./with-defaults-thunk";

/**
 * Decorates a schema with optional defaults backed by a constructor thunk.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { toOptionalWithDefault } from "@beep/schema/core/utils/to-optional-with";
 *
 * const schema = toOptionalWithDefault(S.String)("fallback");
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export const toOptionalWithDefault =
  <const A, const I, const R>(schema: S.Schema<A, I, R>) =>
  (
    defaultValue: Exclude<S.Schema.Type<S.Schema<A, I, R>>, undefined>
  ): S.PropertySignature<":", Exclude<A, undefined>, never, "?:", I | undefined, true, R> =>
    WithDefaultsThunk.make(S.optional(schema))(defaultValue);
