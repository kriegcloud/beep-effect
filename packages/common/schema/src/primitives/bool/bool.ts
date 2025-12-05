/**
 * Boolean helper schemas used throughout BS models.
 *
 * Includes omittable property signatures with defaults as well as literal schemas for always-true/false fields.
 *
 * @example
 * import { BoolWithDefault } from "@beep/schema/primitives/bool/bool";
 * import * as S from "effect/Schema";
 *
 * const enabled = BoolWithDefault(true);
 *
 * @category Primitives/Bool
 * @since 0.1.0
 */

import * as S from "effect/Schema";
import { toOptionalWithDefault } from "../../core/utils/to-optional-with";
import { $BoolId } from "../../internal";

const Id = $BoolId;

/**
 * Property signature representing an optional boolean with write omittability.
 *
 * @example
 * import type { BoolSchema } from "@beep/schema/primitives/bool/bool";
 *
 * type Flag = BoolSchema;
 *
 * @category Primitives/Bool
 * @since 0.1.0
 */
export type BoolSchema = S.PropertySignature<":", boolean, never, "?:", boolean | undefined, true, never>;

/**
 * Helper for optional boolean properties with a provided default value.
 *
 * @example
 * import { BoolWithDefault } from "@beep/schema/primitives/bool/bool";
 *
 * const enabled = BoolWithDefault(true);
 *
 * @category Primitives/Bool
 * @since 0.1.0
 */
export const BoolWithDefault = (defaultValue: boolean): BoolSchema => toOptionalWithDefault(S.Boolean)(defaultValue);

/**
 * Namespace exposing helper types for {@link BoolWithDefault}.
 *
 * @example
 * import { BoolWithDefault } from "@beep/schema/primitives/bool/bool";
 *
 * type Enabled = BoolWithDefault.Type;
 *
 * @category Primitives/Bool
 * @since 0.1.0
 */
export declare namespace BoolWithDefault {
  /**
   * Runtime type for {@link BoolWithDefault}.
   *
   * @example
   * import { BoolWithDefault } from "@beep/schema/primitives/bool/bool";
   *
   * type Enabled = BoolWithDefault.Type;
   *
   * @category Primitives/Bool
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<BoolSchema>;
  /**
   * Encoded type for {@link BoolWithDefault}.
   *
   * @example
   * import { BoolWithDefault } from "@beep/schema/primitives/bool/bool";
   *
   * type EnabledEncoded = BoolWithDefault.Encoded;
   *
   * @category Primitives/Bool
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<BoolSchema>;
}

/**
 * Boolean property signature locked to `true` with omittable writes.
 *
 * @example
 * import { BoolTrue } from "@beep/schema/primitives/bool/bool";
 *
 * const alwaysTrue = BoolTrue;
 *
 * @category Primitives/Bool
 * @since 0.1.0
 */
export const BoolTrue = toOptionalWithDefault(S.Boolean)(true).annotations(
  Id.annotations("bool/BoolTrue", {
    description: "Boolean whose default value resolves to true.",
  })
);

/**
 * Namespace exposing helper types for {@link BoolTrue}.
 *
 * @example
 * import { BoolTrue } from "@beep/schema/primitives/bool/bool";
 *
 * type Flag = BoolTrue.Type;
 *
 * @category Primitives/Bool
 * @since 0.1.0
 */
export declare namespace BoolTrue {
  /**
   * Runtime type for {@link BoolTrue}.
   *
   * @example
   * import { BoolTrue } from "@beep/schema/primitives/bool/bool";
   *
   * type Flag = BoolTrue.Type;
   *
   * @category Primitives/Bool
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof BoolTrue>;
  /**
   * Encoded type for {@link BoolTrue}.
   *
   * @example
   * import { BoolTrue } from "@beep/schema/primitives/bool/bool";
   *
   * type EncodedFlag = BoolTrue.Encoded;
   *
   * @category Primitives/Bool
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof BoolTrue>;
}

/**
 * Boolean property signature locked to `false` with omittable writes.
 *
 * @example
 * import { BoolFalse } from "@beep/schema/primitives/bool/bool";
 *
 * const alwaysFalse = BoolFalse;
 *
 * @category Primitives/Bool
 * @since 0.1.0
 */
export const BoolFalse = toOptionalWithDefault(S.Boolean)(false).annotations(
  Id.annotations("bool/BoolFalse", {
    description: "Boolean whose default value resolves to false.",
  })
);

/**
 * Namespace exposing helper types for {@link BoolFalse}.
 *
 * @example
 * import { BoolFalse } from "@beep/schema/primitives/bool/bool";
 *
 * type Flag = BoolFalse.Type;
 *
 * @category Primitives/Bool
 * @since 0.1.0
 */
export declare namespace BoolFalse {
  /**
   * Runtime type for {@link BoolFalse}.
   *
   * @example
   * import { BoolFalse } from "@beep/schema/primitives/bool/bool";
   *
   * type Flag = BoolFalse.Type;
   *
   * @category Primitives/Bool
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof BoolFalse>;
  /**
   * Encoded type for {@link BoolFalse}.
   *
   * @example
   * import { BoolFalse } from "@beep/schema/primitives/bool/bool";
   *
   * type EncodedFlag = BoolFalse.Encoded;
   *
   * @category Primitives/Bool
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof BoolFalse>;
}

/**
 * Literal schema locked to `true`.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TrueLiteral } from "@beep/schema/primitives/bool/bool";
 *
 * S.decodeSync(TrueLiteral)(true);
 *
 * @category Primitives/Bool
 * @since 0.1.0
 */
export const TrueLiteral = S.Literal(true).annotations(
  Id.annotations("bool/TrueLiteral", {
    description: "Literal boolean that only accepts true.",
  })
);

/**
 * Literal schema locked to `false`.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FalseLiteral } from "@beep/schema/primitives/bool/bool";
 *
 * S.decodeSync(FalseLiteral)(false);
 *
 * @category Primitives/Bool
 * @since 0.1.0
 */
export const FalseLiteral = S.Literal(false).annotations(
  Id.annotations("bool/FalseLiteral", {
    description: "Literal boolean that only accepts false.",
  })
);
