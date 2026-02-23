/**
 * Struct field helpers that assert non-empty Effect Schema definitions.
 *
 * @example
 * import type * as StructTypes from "@beep/types/struct.types";
 * import * as S from "effect/Schema";
 *
 * type Fields = StructTypes.StructFieldsWithStringKeys & { id: S.Struct.Field };
 * let example!: Fields;
 * void example;
 *
 * @category Types/Struct
 * @since 0.1.0
 */
import type * as A from "effect/Array";
import type * as S from "effect/Schema";
import type { NonEmptyRecordWithStringKeys } from "./record.types";
import type * as StringTypes from "./string.types";
import type { NonEmptyString } from "./string.types";
import type * as UnsafeTypes from "./unsafe.types";

/**
 * Effect Schema struct fields keyed by {@link StringTypes.NonEmptyString}.
 *
 * @example
 * import type * as StructTypes from "@beep/types/struct.types";
 * import * as S from "effect/Schema";
 *
 * const fields: StructTypes.StructFieldsWithStringKeys = { id: S.String };
 * void fields;
 *
 * @category Types/Struct
 * @since 0.1.0
 */
export type StructFieldsWithStringKeys = {
  readonly [x: StringTypes.NonEmptyString]: S.Struct.Field;
};

/**
 * Narrows struct fields to the cases where keys are provably non-empty.
 *
 * @example
 * import type * as StructTypes from "@beep/types/struct.types";
 * import * as S from "effect/Schema";
 *
 * type NonEmptyFields = StructTypes.NonEmptyStructFields<{ id: S.Struct.Field }>;
 * let example!: NonEmptyFields;
 * void example;
 *
 * @category Types/Struct
 * @since 0.1.0
 */
export type NonEmptyStructFields<T extends StructFieldsWithStringKeys> = keyof T extends string
  ? keyof T extends NonEmptyString<keyof T>
    ? T extends NonNullable<unknown>
      ? NonNullable<unknown> extends T
        ? never
        : T
      : T
    : never
  : never;

/**
 * Returns a non-empty readonly array of the keys from a struct field map.
 *
 * @example
 * import type * as StructTypes from "@beep/types/struct.types";
 * import * as S from "effect/Schema";
 *
 * type Keys = StructTypes.NonEmptyReadonlyStructFieldKeys<{ id: S.Struct.Field; name: S.Struct.Field }>;
 * let example!: Keys;
 * void example;
 *
 * @category Types/Struct
 * @since 0.1.0
 */
export type NonEmptyReadonlyStructFieldKeys<T extends StructFieldsWithStringKeys> =
  T extends NonEmptyStructFields<T> ? A.NonEmptyReadonlyArray<keyof NonEmptyStructFields<T> & string> : never;

/**
 * Non-empty readonly array of keys when given a non-empty record.
 *
 * @example
 * import type * as StructTypes from "@beep/types/struct.types";
 *
 * type Keys = StructTypes.ReadonlyNonEmptyRecordKeys<{ slug: string }>;
 * let example!: Keys;
 * void example;
 *
 * @category Types/Struct
 * @since 0.1.0
 */
export type ReadonlyNonEmptyRecordKeys<T extends UnsafeTypes.UnsafeReadonlyRecord> =
  T extends NonEmptyRecordWithStringKeys<T> ? A.NonEmptyReadonlyArray<keyof T> : never;

/**
 * Accepts a struct field map or Effect Schema property signatures.
 *
 * @example
 * import type * as StructTypes from "@beep/types/struct.types";
 *
 * type AcceptsFields = StructTypes.StructFieldsOrPropertySignatures;
 * let example!: AcceptsFields;
 * void example;
 *
 * @category Types/Struct
 * @since 0.1.0
 */
export type StructFieldsOrPropertySignatures = StructFieldsWithStringKeys | S.PropertySignature.Any;

/**
 * Ensures struct fields or property signatures have non-empty keys before
 * passing them further downstream.
 *
 * @example
 * import type * as StructTypes from "@beep/types/struct.types";
 * import * as S from "effect/Schema";
 *
 * type SafeFields = StructTypes.NonEmptyStructFieldsOrPropertySignatures<{ id: S.Struct.Field }>;
 * let example!: SafeFields;
 * void example;
 *
 * @category Types/Struct
 * @since 0.1.0
 */
export type NonEmptyStructFieldsOrPropertySignatures<T extends StructFieldsOrPropertySignatures> =
  keyof T extends string
    ? keyof T extends NonEmptyString<keyof T>
      ? T extends NonNullable<unknown>
        ? NonNullable<unknown> extends T
          ? never
          : T
        : T
      : never
    : never;
