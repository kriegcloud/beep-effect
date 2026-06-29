/**
 * Experimental effect/Schema models for Box Node SDK payloads.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/values/SerializedData/SerializedData.model");

/**
 * Namespace for {@link SerializedData} containing the recursive encoded type.
 *
 * @example
 * ```ts
 * import type * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 *
 * const encoded: BoxSchemas.SerializedData.Encoded = ["report.pdf", 1024, true, null]
 * console.log(encoded)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export declare namespace SerializedData {
  /**
   * The encoded form of {@link SerializedData}, expressed recursively to break the schema cycle.
   *
   * @category type-level
   * @since 0.0.0
   */
  export type Encoded =
    | undefined
    | null
    | boolean
    | number
    | string
    | SerializedDataList.Encoded
    | SerializedDataMap.Encoded;
}

/**
 * Recursive schema for serializable Box payload data: primitives, lists, and string-keyed maps.
 *
 * @example
 * ```ts
 * import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 * import * as S from "effect/Schema"
 *
 * const decoded = S.decodeUnknownSync(BoxSchemas.SerializedData)({ name: "report.pdf", size: 1024 })
 * console.log(decoded)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SerializedData = S.Union([
  S.Undefined,
  S.Null,
  S.Boolean,
  S.Finite,
  S.String,
  S.suspend((): S.Codec<SerializedDataList.Encoded> => SerializedDataList),
  S.suspend((): S.Codec<SerializedDataMap.Encoded> => SerializedDataMap),
]).pipe(
  $I.annoteSchema("SerializedData", {
    description:
      "A schema for serializable data types used in the Box driver, including undefined, null, booleans, numbers, strings, lists, and maps.",
  })
);

/**
 * {@inheritDoc SerializedData}
 *
 * @category type-level
 * @since 0.0.0
 */
export type SerializedData = typeof SerializedData.Type;

/**
 * Namespace for {@link SerializedDataList} containing the recursive encoded type.
 *
 * @example
 * ```ts
 * import type * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 *
 * const encoded: BoxSchemas.SerializedDataList.Encoded = ["file.txt", 42, false]
 * console.log(encoded.length)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export declare namespace SerializedDataList {
  /**
   * The encoded form of {@link SerializedDataList}: a readonly array of encoded serialized data.
   *
   * @category type-level
   * @since 0.0.0
   */
  export type Encoded = readonly SerializedData.Encoded[];
}

/**
 * Schema for lists of serializable Box payload data.
 *
 * @example
 * ```ts
 * import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 * import * as S from "effect/Schema"
 *
 * const decoded = S.decodeUnknownSync(BoxSchemas.SerializedDataList)(["file.txt", 42, true])
 * console.log(decoded)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SerializedDataList = S.Array(S.suspend((): S.Codec<SerializedData.Encoded> => SerializedData)).pipe(
  $I.annoteSchema("SerializedDataList", {
    description:
      "A schema for serializable data lists used in the Box driver, containing encoded serialized data elements.",
  })
);

/**
 * {@inheritDoc SerializedDataList}
 *
 * @category type-level
 * @since 0.0.0
 */
export type SerializedDataList = typeof SerializedDataList.Type;

/**
 * Namespace for {@link SerializedDataMap} containing the recursive encoded type.
 *
 * @example
 * ```ts
 * import type * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 *
 * const encoded: BoxSchemas.SerializedDataMap.Encoded = { name: "report.pdf", size: 1024 }
 * console.log(encoded)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export declare namespace SerializedDataMap {
  /**
   * The encoded form of {@link SerializedDataMap}: string keys to encoded serialized data values.
   *
   * @category type-level
   * @since 0.0.0
   */
  export type Encoded = {
    readonly [key: string]: SerializedData.Encoded;
  };
}

/**
 * Schema for string-keyed maps of serializable Box payload data.
 *
 * @example
 * ```ts
 * import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 * import * as S from "effect/Schema"
 *
 * const decoded = S.decodeUnknownSync(BoxSchemas.SerializedDataMap)({ name: "report.pdf", size: 1024 })
 * console.log(decoded)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SerializedDataMap = S.Record(
  S.String,
  S.suspend((): S.Codec<SerializedData.Encoded> => SerializedData)
).pipe(
  $I.annoteSchema("SerializedDataMap", {
    description:
      "A schema for serializable data maps used in the Box driver, mapping string keys to encoded serialized data values.",
  })
);

/**
 * {@inheritDoc SerializedDataMap}
 *
 * @category type-level
 * @since 0.0.0
 */
export type SerializedDataMap = typeof SerializedDataMap.Type;
