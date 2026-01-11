/**
 * Enum factory implementation that fuels `Utils.deriveKeyEnum`, keeping literal
 * preservation consistent for doc and runtime consumers.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const enumFactoryRecord: FooTypes.Prettify<{ pending: object; active: object }> = {
 *   pending: {},
 *   active: {},
 * };
 * const enumFactoryKeys = Utils.deriveKeyEnum(enumFactoryRecord);
 * void enumFactoryKeys;
 *
 * @category Documentation
 * @since 0.1.0
 */
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as R from "effect/Record";
import { create } from "mutative";

/**
 * Type signature describing helpers that derive a `key -> key` enum from an
 * object literal.
 *
 * @example
 * import type { DeriveKeyEnum } from "@beep/utils/factories/enum.factory";
 * import { deriveKeyEnum } from "@beep/utils/factories/enum.factory";
 *
 * const enumFactoryDerive: DeriveKeyEnum = deriveKeyEnum;
 * void enumFactoryDerive;
 *
 * @category Factories
 * @since 0.1.0
 */
export type DeriveKeyEnum = <T extends Record<string, unknown>>(
  record: T
) => {
  readonly [K in keyof T]: K;
};
/**
 * Builds an enum-like object whose values mirror the keys of the input record,
 * useful for storing canonical keys alongside runtime values.
 *
 * @example
 * import { deriveKeyEnum } from "@beep/utils/factories/enum.factory";
 *
 * const Status = deriveKeyEnum({ pending: {}, active: {} });
 * // { pending: "pending", active: "active" }
 *
 * @category Factories
 * @since 0.1.0
 */
export const deriveKeyEnum: DeriveKeyEnum = <T extends Record<string, unknown>>(record: T) =>
  F.pipe(
    R.keys(record),
    A.reduce(
      {} as { readonly [K in keyof T]: K },
      (acc, k) =>
        create(acc, (draft: { [K in keyof T]: K }) => {
          draft[k as keyof typeof draft] = k;
        }) as { readonly [K in keyof T]: K }
    )
  );
