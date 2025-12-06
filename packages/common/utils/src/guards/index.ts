/**
 * Collects guard implementations (record safety, unsafe property detection)
 * for namespaced docs and runtime imports.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const guardsIndexProperty = Utils.isUnsafeProperty("__proto__");
 * const guardsIndexRecord: FooTypes.Prettify<{ label: string }> = { label: "noop" };
 * void guardsIndexProperty;
 * void guardsIndexRecord;
 *
 * @category Documentation
 * @since 0.1.0
 */
/**
 * Re-exports the non-empty record guard.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const guardsIndexRecordInput: { readonly foo: number } = { foo: 1 };
 * const guardsIndexNonEmpty = Utils.isNonEmptyRecordWithNonEmptyStringKeys(guardsIndexRecordInput);
 * void guardsIndexNonEmpty;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * from "@beep/utils/guards/isNonEmptyRecord.guard";

/**
 * Re-exports the unsafe property guard.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const guardsIndexUnsafe = Utils.isUnsafeProperty("__proto__");
 * void guardsIndexUnsafe;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * from "@beep/utils/guards/isUnsafeProperty.guard";
