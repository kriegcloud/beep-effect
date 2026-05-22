/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { A, P, Str, Struct } from "@beep/utils";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import type { ColumnNameFor, LastPathSegment, TableNameFromIdentifier } from "./EntitySchema.definition.ts";
import type {
  IndexHint,
  PersistDescriptor,
  PersistOptions,
  PersistStrategy,
  StorageKind,
} from "./EntitySchema.persist.ts";

const descriptor =
  <const TStorageKind extends StorageKind>(storageKind: TStorageKind) =>
  <
    const Strategy extends PersistStrategy = "provided",
    const ColumnName extends string | undefined = undefined,
    const IndexHints extends ReadonlyArray<IndexHint> | undefined = undefined,
  >(
    options?: PersistOptions<Strategy, ColumnName, IndexHints>
  ): PersistDescriptor<TStorageKind, Strategy, ColumnName, IndexHints> => {
    const base = {
      storageKind,
      valueStrategy: options?.valueStrategy ?? ("provided" as Strategy),
    };
    return Struct.assign(
      Struct.assign(base, P.isUndefined(options?.columnName) ? {} : { columnName: options.columnName }),
      P.isUndefined(options?.indexHints) ? {} : { indexHints: options.indexHints }
    ) as unknown as PersistDescriptor<TStorageKind, Strategy, ColumnName, IndexHints>;
  };

/**
 * Persistence descriptor constructors.
 *
 * @since 0.0.0
 * @category constructors
 */
export const persist = {
  blob: descriptor("blob"),
  bool: descriptor("bool"),
  entityId: descriptor("entityId"),
  int: descriptor("int"),
  jsonb: descriptor("jsonb"),
  literal: descriptor("literal"),
  text: descriptor("text"),
  timestampDate: descriptor("timestampDate"),
  timestampMillis: descriptor("timestampMillis"),
} as const;

/**
 * Epoch-millis DateTime schema used by persisted timestamp fields.
 *
 * @since 0.0.0
 * @category schemas
 */
export const DateTimeFromMillis = S.DateTimeUtcFromMillis;

/**
 * Integer schema used by persisted integer fields.
 *
 * @since 0.0.0
 * @category schemas
 */
export const int = S.Int;

/**
 * Literal schema helper for persisted discriminators.
 *
 * @since 0.0.0
 * @category constructors
 */
export const literal = <const Value extends string | number | boolean | bigint>(value: Value): S.Literal<Value> =>
  S.Literal(value);

const titleSegment = <const Identifier extends string>(identifier: Identifier): LastPathSegment<Identifier> =>
  A.lastNonEmpty(Str.split(identifier, "/")) as LastPathSegment<Identifier>;

/**
 * Derive a table name from the final segment of a schema identifier.
 *
 * @since 0.0.0
 * @category formatting
 */
export const tableNameFromIdentifier = <const Identifier extends string>(
  identifier: Identifier
): TableNameFromIdentifier<Identifier> =>
  Str.snakeCase(titleSegment(identifier)) as TableNameFromIdentifier<Identifier>;

/**
 * Resolve a column name from field key and descriptor override.
 *
 * @since 0.0.0
 * @category formatting
 */
export const columnNameFor: {
  <const Key extends string, const Descriptor extends PersistDescriptor>(
    key: Key,
    descriptor: Descriptor
  ): ColumnNameFor<Key, Descriptor>;
  <const Descriptor extends PersistDescriptor>(
    descriptor: Descriptor
  ): <const Key extends string>(key: Key) => ColumnNameFor<Key, Descriptor>;
} = dual(
  2,
  <const Key extends string, const Descriptor extends PersistDescriptor>(
    key: Key,
    descriptor: Descriptor
  ): ColumnNameFor<Key, Descriptor> => (descriptor.columnName ?? Str.snakeCase(key)) as ColumnNameFor<Key, Descriptor>
);
