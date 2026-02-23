/**
 * Top-level entry for getter utilities, ensuring the docs highlight
 * `@beep/utils` namespace usage for nested property lookups.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const gettersModuleRecord: FooTypes.Prettify<{ user: { id: string } }> = { user: { id: "user_123" } };
 * const gettersModuleValue = Utils.getAt(gettersModuleRecord, "user.id");
 * void gettersModuleValue;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * from "@beep/utils/getters/index";
