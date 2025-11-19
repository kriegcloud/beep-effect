/**
 * Default thunk helpers shared by optional schema utilities.
 *
 * Encapsulates how constructor/decoder defaults are applied without duplicating logic per module.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { WithDefaultsThunk } from "@beep/schema/core/utils/with-defaults-thunk";
 *
 * const applyDefault = WithDefaultsThunk.make(S.optional(S.String));
 *
 * @category Core/Utils
 * @since 0.1.0
 */
import * as F from "effect/Function";
import * as S from "effect/Schema";

/**
 * Property signature type decorated with constructor/decoder defaults.
 *
 * @example
 * import * as S from "effect/Schema";
 * import type { Type } from "@beep/schema/core/utils/with-defaults-thunk/with-defaults-thunk";
 *
 * type WithTag = Type<"person", "person", never>;
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export type Type<A, I, R> = S.PropertySignature<":", Exclude<A, undefined>, never, "?:", I | undefined, true, R>;

/**
 * Function signature that applies constructor defaults to optional schemas.
 *
 * @example
 * import type { Maker } from "@beep/schema/core/utils/with-defaults-thunk/with-defaults-thunk";
 *
 * declare const attachDefault: Maker<string, string, never>;
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export type Maker<A, I, R> = (defaultValue: Exclude<A, undefined>) => Type<A, I, R>;

/**
 * Lazily attaches defaults to optional schemas via constructor/decoder thunks.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { make } from "@beep/schema/core/utils/with-defaults-thunk/with-defaults-thunk";
 *
 * const schema = make(S.optional(S.String))("default");
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export const make =
  <const A, const I, const R>(self: S.optional<S.Schema<A, I, R>>) =>
  (defaultValue: Exclude<A, undefined>): Type<A, I, R> => {
    const thunk = F.pipe(
      F.constant<typeof defaultValue>(defaultValue),
      (fn) => ({ decoding: fn, constructor: fn }) as const
    );

    return self.pipe(S.withDefaults(thunk));
  };
