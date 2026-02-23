/**
 * Organizes the array, record, struct, model, and string utilities under
 * namespace-friendly objects so consumers can `import * as Utils` and reach
 * cohesive helpers.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const dataIndexName: FooTypes.Prettify<{ name: string }> = { name: "Ada Lovelace" };
 * const dataIndexInitials = Utils.StrUtils.getNameInitials(dataIndexName.name);
 * void dataIndexInitials;
 *
 * @category Documentation
 * @since 0.1.0
 */
/**
 * Namespaces array helpers under `Utils.ArrayUtils`.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const dataArraySorted = Utils.ArrayUtils.orderBy(
 *   [
 *     { name: "b" },
 *     { name: "a" },
 *   ],
 *   ["name"],
 *   ["asc"]
 * );
 * void dataArraySorted;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * as ArrayUtils from "@beep/utils/data/array.utils/index";

/**
 * Namespaces model helpers under `Utils.ModelUtils`.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const dataModelTable = { fields: { id: {} } };
 * const dataModelKeys = Utils.ModelUtils.modelFieldKeys(dataModelTable);
 * void dataModelKeys;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * as ModelUtils from "@beep/utils/data/model.utils";

/**
 * Namespaces object helpers under `Utils.ObjectUtils`.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const dataObjectMerged = Utils.ObjectUtils.deepMerge({ settings: { theme: "light" } }, { settings: { theme: "dark" } });
 * void dataObjectMerged;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * as ObjectUtils from "@beep/utils/data/object.utils/index";

/**
 * Namespaces record helpers under `Utils.RecordUtils`.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const dataRecordLocales: { readonly en: "English" } = { en: "English" };
 * const dataRecordKeys = Utils.RecordUtils.recordKeys(dataRecordLocales);
 * void dataRecordKeys;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * as RecordUtils from "@beep/utils/data/record.utils";

/**
 * Namespaces string helpers under `Utils.StrUtils`.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const dataStringNormalized = Utils.StrUtils.normalizeString("Größe");
 * void dataStringNormalized;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * as StrUtils from "@beep/utils/data/string.utils";

/**
 * Namespaces struct helpers under `Utils.StructUtils`.
 *
 * @example
 * import * as Utils from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * const dataStructFields = { id: S.String };
 * const dataStructEntries = Utils.StructUtils.structEntries(dataStructFields);
 * void dataStructEntries;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * as StructUtils from "@beep/utils/data/struct.utils";

/**
 * Namespaces tuple helpers under `Utils.TupleUtils`.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const dataTupleEnum = Utils.TupleUtils.makeMappedEnum("pending", "active")(
 *   ["pending", "PENDING"] as const,
 *   ["active", "ACTIVE"] as const
 * );
 * const dataTupleValue = dataTupleEnum.Enum.ACTIVE;
 * void dataTupleValue;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * as TupleUtils from "@beep/utils/data/tuple.utils";
