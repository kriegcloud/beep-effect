/**
 * Exposes deep getter helpers under the namespace entry so generated docs link
 * directly to `Utils.getAt`.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const gettersIndexRecord: FooTypes.Prettify<{ tenant: { slug: string } }> = { tenant: { slug: "beep" } };
 * const gettersIndexSlug = Utils.getAt(gettersIndexRecord, "tenant.slug");
 * void gettersIndexSlug;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * from "@beep/utils/getters/getAt";
