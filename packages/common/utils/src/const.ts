/**
 * Literal-preserving helpers that demonstrate how the `@beep/utils` namespace
 * exposes constant factories for downstream schema construction.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const constModuleRecord: FooTypes.Prettify<{ role: string }> = {
 *   role: Utils.constLiteral("admin"),
 * };
 * void constModuleRecord;
 *
 * @category Documentation
 * @since 0.1.0
 */
/**
 * Function type describing helpers that preserve literal inference when
 * returning the provided value.
 *
 * @example
 * import type { ConstLiteral } from "@beep/utils/const";
 *
 * const keep: ConstLiteral = (value) => value;
 *
 * @category Data
 * @since 0.1.0
 */
type ConstLiteral = <const Literal extends string | number>(literal: Literal) => Literal;
/**
 * Returns the provided literal value without widening to `string`/`number`.
 *
 * @example
 * import { constLiteral } from "@beep/utils/const";
 *
 * const role = constLiteral("admin");
 *
 * @category Data
 * @since 0.1.0
 */
export const constLiteral: ConstLiteral = <const Literal extends string | number>(literal: Literal) => literal;
