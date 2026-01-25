/**
 * Root namespace for `@beep/utils`, bundling binary helpers, factories, guards,
 * and typed data utilities consumed across apps.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const utilsIndexRecord: FooTypes.Prettify<{ name: string }> = { name: "Example" };
 * const utilsIndexInitials = Utils.StrUtils.getNameInitials(utilsIndexRecord.name);
 * void utilsIndexInitials;
 *
 * @category exports
 * @since 0.1.0
 */
import * as DataUtils from "@beep/utils/data";

/**
 * Routes binary blob helpers through the root namespace.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexArrayBufferBlob = Utils.arrayBufferToBlob(new ArrayBuffer(2));
 * void indexArrayBufferBlob;
 *
 * @category exports
 * @since 0.1.0
 */
export * from "@beep/utils/array-buffer-to-blob";

/**
 * Routes `arrayBufferToUint8Array` helpers through the root namespace.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexArrayBufferBytes = Utils.arrayBufferToUint8Array(new ArrayBuffer(2));
 * void indexArrayBufferBytes;
 *
 * @category exports
 * @since 0.1.0
 */
export * from "@beep/utils/array-buffer-to-uint8-array";

/**
 * Exposes array utilities via the namespace wrapper.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexArrayUtilsResult = Utils.ArrayUtils.orderBy(
 *   [
 *     { name: "b" },
 *     { name: "a" },
 *   ],
 *   ["name"],
 *   ["asc"]
 * );
 * void indexArrayUtilsResult;
 *
 * @category exports
 * @since 0.1.0
 */
export const ArrayUtils = DataUtils.ArrayUtils;

/**
 * Exposes model helpers (`ModelUtils`) via the namespace.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexModelTable = { fields: { id: {} } };
 * const indexModelKeys = Utils.ModelUtils.modelFieldKeys(indexModelTable);
 * void indexModelKeys;
 *
 * @category exports
 * @since 0.1.0
 */
export const ModelUtils = DataUtils.ModelUtils;

/**
 * Surfaces object utilities (`ObjectUtils`) via the namespace.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexObjectMerge = Utils.ObjectUtils.deepMerge({ value: 1 }, { value: 2 });
 * void indexObjectMerge;
 *
 * @category exports
 * @since 0.1.0
 */
export const ObjectUtils = DataUtils.ObjectUtils;

/**
 * Re-exports `RecordUtils` for namespaced consumption.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexRecordLocales: { readonly foo: "bar" } = { foo: "bar" };
 * const indexRecordValues = Utils.RecordUtils.recordStringValues(indexRecordLocales);
 * void indexRecordValues;
 *
 * @category exports
 * @since 0.1.0
 */
export const RecordUtils = DataUtils.RecordUtils;

/**
 * Makes string helpers (`StrUtils`) available at the root.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexStrInitials = Utils.StrUtils.getNameInitials("Ada Lovelace");
 * void indexStrInitials;
 *
 * @category exports
 * @since 0.1.0
 */
export const StrUtils = DataUtils.StrUtils;

/**
 * Makes struct helpers (`StructUtils`) available at the root.
 *
 * @example
 * import * as Utils from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * const indexStructFields = { id: S.String };
 * const indexStructValues = Utils.StructUtils.structValues(indexStructFields);
 * void indexStructValues;
 *
 * @category exports
 * @since 0.1.0
 */
export const StructUtils = DataUtils.StructUtils;

/**
 * Makes tuple helpers (`TupleUtils`) available at the root namespace.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexTupleEnum = Utils.TupleUtils.makeMappedEnum("pending", "active")(
 *   ["pending", "PENDING"] as const,
 *   ["active", "ACTIVE"] as const
 * );
 * const indexTupleMapped = indexTupleEnum.Enum.ACTIVE;
 * void indexTupleMapped;
 *
 * @category exports
 * @since 0.1.0
 */
export const TupleUtils = DataUtils.TupleUtils;

/**
 * Re-exports deep equality helpers through the namespace.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexEquality = Utils.deepEqual({ id: 1 }, { id: 1 });
 * void indexEquality;
 *
 * @category exports
 * @since 0.1.0
 */
export * from "@beep/utils/equality/index";

/**
 * Exposes factory helpers (enum derivation) through the namespace.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexFactoryEnum = Utils.deriveKeyEnum({ pending: {}, active: {} });
 * void indexFactoryEnum;
 *
 * @category exports
 * @since 0.1.0
 */
export * from "@beep/utils/factories";

/**
 * Re-exports time formatting helpers such as `fToNow`.
 *
 * @example
 * import * as Utils from "@beep/utils";
 * import dayjs from "dayjs";
 *
 * const indexFormatTime = Utils.fToNow(dayjs().subtract(30, "minute"));
 * void indexFormatTime;
 *
 * @category exports
 * @since 0.1.0
 */
export * from "@beep/utils/format-time";

/**
 * Provides nested getter helpers such as `getAt`.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexGetterValue = Utils.getAt({ item: { id: 1 } }, "item.id");
 * void indexGetterValue;
 *
 * @category exports
 * @since 0.1.0
 */
export * from "@beep/utils/getters";

/**
 * Surfaces runtime guards (record safety, unsafe property predicates).
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexGuard = Utils.isUnsafeProperty("__proto__");
 * void indexGuard;
 *
 * @category exports
 * @since 0.1.0
 */
export * from "@beep/utils/guards";

/**
 * Routes mutation helpers (readonly escapes) through the namespace.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexMutReadonly = [1, 2] as const;
 * const indexMutArray = Utils.removeReadonly(indexMutReadonly);
 * const indexMutFirst = indexMutArray[0];
 * void indexMutFirst;
 *
 * @category exports
 * @since 0.1.0
 */
export * from "@beep/utils/mut.utils";

/**
 * Makes noop helpers (`noOp`, `nullOp`, `nullOpE`) available via the namespace.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * Utils.noOp();
 *
 * @category exports
 * @since 0.1.0
 */
export * from "@beep/utils/noOps";

/**
 * Exposes nested object path utilities.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexPath = Utils.getPath({ user: { id: "id" } }, "user.id");
 * void indexPath;
 *
 * @category exports
 * @since 0.1.0
 */
export * from "@beep/utils/object/path";

/**
 * Routes debounce/throttle helpers through the namespace.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexTiming = Utils.debounce(() => {}, 50);
 * void indexTiming;
 *
 * @category exports
 * @since 0.1.0
 */
export * from "@beep/utils/timing/index";

/**
 * Exposes transformation helpers (enum builders, values extractors).
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexTransformations = Utils.enumFromStringArray("draft", "live");
 * void indexTransformations;
 *
 * @category exports
 * @since 0.1.0
 */
export * from "@beep/utils/transformations";

/**
 * Exposes conversions from `Uint8Array` to `ArrayBuffer`.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const indexUint8Buffer = Utils.uint8arrayToArrayBuffer(new Uint8Array([1, 2]));
 * void indexUint8Buffer;
 *
 * @category exports
 * @since 0.1.0
 */
export * from "@beep/utils/uint8-array-to-array-buffer";

/**
 * Re-exports autosuggest highlight utilities.
 *
 * @example
 * ```typescript
 * import { AutosuggestHighlight } from "@beep/utils"
 *
 * const matches = AutosuggestHighlight.match("hello world", "wor")
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * as AutosuggestHighlight from "./autosuggest-highlight";

/**
 * Re-exports browser API detection utilities.
 *
 * @example
 * ```typescript
 * import { IS_MOBILE, isWindowDefined } from "@beep/utils"
 *
 * if (isWindowDefined) {
 *   console.log("Running in browser")
 * }
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./browser-apis";

/**
 * Re-exports boolean coercion utilities.
 *
 * @example
 * ```typescript
 * import { coerceTrue, coerceFalse } from "@beep/utils"
 *
 * const value = coerceTrue(undefined)  // true
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./coerce";

/**
 * Re-exports dedent utilities for template string formatting.
 *
 * @example
 * ```typescript
 * import { dedent } from "@beep/utils"
 *
 * const text = dedent`
 *   Hello
 *   World
 * `
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./dedent";

/**
 * Re-exports deep null removal utilities.
 *
 * @example
 * ```typescript
 * import { deepRemoveNull } from "@beep/utils"
 *
 * const cleaned = deepRemoveNull({ a: 1, b: null })
 * // => { a: 1 }
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./deep-remove-null";
export * from "./nullable";
/**
 * Re-exports random hex string generator.
 *
 * @example
 * ```typescript
 * import { randomHexString } from "@beep/utils"
 *
 * const hex = randomHexString(16)
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./random-hex-string";
/**
 * Re-exports accent removal utilities.
 *
 * @example
 * ```typescript
 * import { RemoveAccents } from "@beep/utils"
 *
 * const cleaned = RemoveAccents.removeAccents("café")
 * // => "cafe"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * as RemoveAccents from "./remove-accents/remove-accents";
/**
 * Re-exports HTML sanitization utilities.
 *
 * @example
 * ```typescript
 * import { SanitizeHtml } from "@beep/utils"
 *
 * const safe = SanitizeHtml.sanitizeHtml("<script>alert('XSS')</script><p>Hello</p>")
 * // => "<p>Hello</p>"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * as SanitizeHtml from "./sanitize-html";
export * from "./sqids";
export { default as Sqids } from "./sqids";
export * from "./thunk";
/**
 * Re-exports topological sort utilities.
 *
 * @example
 * ```typescript
 * import { TopoSort } from "@beep/utils"
 *
 * const sorted = TopoSort.toposort([["a", "b"], ["b", "c"]])
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * as TopoSort from "./topo-sort";
