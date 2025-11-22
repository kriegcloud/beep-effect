/**
 * Nullable helper schemas for core scalar types (string, number, date, unknown).
 *
 * Each helper wraps a primitive schema with `S.NullOr` so applications can quickly model optional database columns while keeping consistent annotations.
 *
 * @example
 * import { NullableStr } from "@beep/schema/derived/kits/nullables";
 *
 * const description = NullableStr;
 *
 * @category Derived/Kits
 * @since 0.1.0
 */

import { $KitsId } from "@beep/schema/internal";
import { DateTimeUtcFromAllAcceptable } from "@beep/schema/primitives";
import * as S from "effect/Schema";

const { $NullablesId: Id } = $KitsId.compose("nullables");

/**
 * Nullable string schema (string | null).
 *
 * @example
 * import { NullableStr } from "@beep/schema/derived/kits/nullables";
 *
 * S.decodeSync(NullableStr)("hello");
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export class NullableStr extends S.NullOr(S.String).annotations(
  Id.annotations("nullables/NullableStr", {
    description: "A nullable string (string | null).",
  })
) {}

/**
 * Namespace exposing helper types for {@link NullableStr}.
 *
 * @example
 * import type { NullableStr } from "@beep/schema/derived/kits/nullables";
 *
 * type Value = NullableStr.Type;
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export declare namespace NullableStr {
  /**
   * Runtime type for {@link NullableStr}.
   *
   * @example
   * import type { NullableStr } from "@beep/schema/derived/kits/nullables";
   *
   * let value: NullableStr.Type;
   *
   * @category Derived/Kits
   * @since 0.1.0
   */
  export type Type = typeof NullableStr.Type;
  /**
   * Encoded type for {@link NullableStr}.
   *
   * @example
   * import type { NullableStr } from "@beep/schema/derived/kits/nullables";
   *
   * let encoded: NullableStr.Encoded;
   *
   * @category Derived/Kits
   * @since 0.1.0
   */
  export type Encoded = typeof NullableStr.Encoded;
}

/**
 * Nullable number schema (number | null).
 *
 * @example
 * import { NullableNum } from "@beep/schema/derived/kits/nullables";
 *
 * S.decodeSync(NullableNum)(42);
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export class NullableNum extends S.NullOr(S.Number).annotations(
  Id.annotations("nullables/NullableNum", {
    description: "A nullable number (number | null).",
  })
) {}

/**
 * Namespace exposing helper types for {@link NullableNum}.
 *
 * @example
 * import type { NullableNum } from "@beep/schema/derived/kits/nullables";
 *
 * type Value = NullableNum.Type;
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export declare namespace NullableNum {
  /**
   * Runtime type for {@link NullableNum}.
   *
   * @example
   * import type { NullableNum } from "@beep/schema/derived/kits/nullables";
   *
   * let value: NullableNum.Type;
   *
   * @category Derived/Kits
   * @since 0.1.0
   */
  export type Type = typeof NullableNum.Type;
  /**
   * Encoded type for {@link NullableNum}.
   *
   * @example
   * import type { NullableNum } from "@beep/schema/derived/kits/nullables";
   *
   * let encoded: NullableNum.Encoded;
   *
   * @category Derived/Kits
   * @since 0.1.0
   */
  export type Encoded = typeof NullableNum.Encoded;
}

/**
 * Nullable DateTime schema using {@link DateTimeUtcFromAllAcceptable} as the base.
 *
 * @example
 * import { NullableDate } from "@beep/schema/derived/kits/nullables";
 *
 * S.decodeSync(NullableDate)(new Date());
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export class NullableDate extends S.NullOr(DateTimeUtcFromAllAcceptable).annotations(
  Id.annotations("nullables/NullableDate", {
    description: "A nullable Date represented as TIMESTAMPTZ | null.",
  })
) {}

/**
 * Namespace exposing helper types for {@link NullableDate}.
 *
 * @example
 * import type { NullableDate } from "@beep/schema/derived/kits/nullables";
 *
 * type Value = NullableDate.Type;
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export declare namespace NullableDate {
  /**
   * Runtime type for {@link NullableDate}.
   *
   * @example
   * import type { NullableDate } from "@beep/schema/derived/kits/nullables";
   *
   * let value: NullableDate.Type;
   *
   * @category Derived/Kits
   * @since 0.1.0
   */
  export type Type = typeof NullableDate.Type;
  /**
   * Encoded type for {@link NullableDate}.
   *
   * @example
   * import type { NullableDate } from "@beep/schema/derived/kits/nullables";
   *
   * let encoded: NullableDate.Encoded;
   *
   * @category Derived/Kits
   * @since 0.1.0
   */
  export type Encoded = typeof NullableDate.Encoded;
}

/**
 * Nullable unknown schema (unknown | null).
 *
 * @example
 * import { NullableUnknown } from "@beep/schema/derived/kits/nullables";
 *
 * S.decodeSync(NullableUnknown)(null);
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export class NullableUnknown extends S.NullOr(S.Unknown).annotations(
  Id.annotations("nullables/NullableUnknown", {
    description: "A nullable unknown value.",
  })
) {}

/**
 * Namespace exposing helper types for {@link NullableUnknown}.
 *
 * @example
 * import type { NullableUnknown } from "@beep/schema/derived/kits/nullables";
 *
 * type Value = NullableUnknown.Type;
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export declare namespace NullableUnknown {
  /**
   * Runtime type for {@link NullableUnknown}.
   *
   * @example
   * import type { NullableUnknown } from "@beep/schema/derived/kits/nullables";
   *
   * let value: NullableUnknown.Type;
   *
   * @category Derived/Kits
   * @since 0.1.0
   */
  export type Type = typeof NullableUnknown.Type;
  /**
   * Encoded type for {@link NullableUnknown}.
   *
   * @example
   * import type { NullableUnknown } from "@beep/schema/derived/kits/nullables";
   *
   * let encoded: NullableUnknown.Encoded;
   *
   * @category Derived/Kits
   * @since 0.1.0
   */
  export type Encoded = typeof NullableUnknown.Encoded;
}
