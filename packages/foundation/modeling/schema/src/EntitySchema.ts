/**
 * Schema-first persisted entity modeling primitives.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import * as Str from "@beep/utils/Str";
import * as Struct from "@beep/utils/Struct";
import { SchemaAST as AST, Match } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import type { Simplify, Assign as StructAssign } from "effect/Struct";
import { LiteralKit } from "./LiteralKit.ts";
import * as Model from "./Model.ts";
import * as SchemaUtils from "./SchemaUtils/index.ts";

const $I = $SchemaId.create("EntitySchema");

const DefinitionAnnotationKey = "@beep/schema/EntitySchema/definition" as const;

/**
 * Schema field map accepted by {@link ClassFactory}.
 *
 * @since 0.0.0
 * @category models
 */
export type Fields = Readonly<Record<string, S.Top>>;

/**
 * Physical storage kind projected by table adapters.
 *
 * @since 0.0.0
 * @category schemas
 */
export const StorageKind = LiteralKit([
  "blob",
  "bool",
  "entityId",
  "int",
  "jsonb",
  "literal",
  "text",
  "timestampMillis",
]).pipe(
  $I.annoteSchema("StorageKind", {
    description: "Physical storage kind projected from a schema-first entity field.",
  })
);

/**
 * Runtime type for {@link StorageKind}.
 *
 * @since 0.0.0
 * @category models
 */
export type StorageKind = typeof StorageKind.Type;

/**
 * Lifecycle strategy for a persisted field.
 *
 * @since 0.0.0
 * @category schemas
 */
export const ValueStrategy = LiteralKit([
  "computedByService",
  "defaultedOnInsert",
  "derived",
  "generatedOnInsert",
  "incrementedOnWrite",
  "provided",
  "providedByContext",
  "updatedOnWrite",
]).pipe(
  $I.annoteSchema("ValueStrategy", {
    description: "Lifecycle strategy used to derive entity variants for a persisted field.",
  })
);

/**
 * Runtime type for {@link ValueStrategy}.
 *
 * @since 0.0.0
 * @category models
 */
export type ValueStrategy = typeof ValueStrategy.Type;

/**
 * Compatibility alias for lifecycle strategy.
 *
 * @since 0.0.0
 * @category models
 */
export const PersistStrategy = ValueStrategy;

/**
 * Runtime type for {@link PersistStrategy}.
 *
 * @since 0.0.0
 * @category models
 */
export type PersistStrategy = ValueStrategy;

/**
 * Storage-neutral index hint kind.
 *
 * @since 0.0.0
 * @category schemas
 */
export const IndexHintKind = LiteralKit(["btree", "gin", "hash", "lookup", "unique"]).pipe(
  $I.annoteSchema("IndexHintKind", {
    description: "Storage-neutral index hint kind attached to a persisted field.",
  })
);

/**
 * Runtime type for {@link IndexHintKind}.
 *
 * @since 0.0.0
 * @category models
 */
export type IndexHintKind = typeof IndexHintKind.Type;

const IndexHintBase = IndexHintKind.toTaggedUnion("kind")({
  btree: {},
  gin: {},
  hash: {},
  lookup: {},
  unique: {},
}).pipe(
  $I.annoteSchema("IndexHint", {
    description: "Storage-neutral index hint attached to a persisted field.",
  })
);

/**
 * Storage-neutral index hint values and schema.
 *
 * @since 0.0.0
 * @category schemas
 */
export const IndexHint = Struct.assign(IndexHintBase, {
  btree: { kind: "btree" } as const,
  gin: { kind: "gin" } as const,
  hash: { kind: "hash" } as const,
  lookup: { kind: "lookup" } as const,
  unique: { kind: "unique" } as const,
});

/**
 * Runtime type for {@link IndexHint}.
 *
 * @since 0.0.0
 * @category models
 */
export type IndexHint = typeof IndexHint.Type;

/**
 * Encoded absence classification for a field.
 *
 * @since 0.0.0
 * @category schemas
 */
export const EncodedAbsenceKind = LiteralKit([
  "required",
  "nullable",
  "undefined",
  "nullish",
  "optionalKey",
  "optionalNullable",
  "optionalUndefined",
  "optionalNullish",
  "ambiguous",
]).pipe(
  $I.annoteSchema("EncodedAbsenceKind", {
    description: "Classifies how an encoded entity field represents absence at a persistence boundary.",
  })
);

/**
 * Runtime type for {@link EncodedAbsenceKind}.
 *
 * @since 0.0.0
 * @category models
 */
export type EncodedAbsenceKind = typeof EncodedAbsenceKind.Type;

/**
 * Options accepted by persistence descriptor constructors.
 *
 * @since 0.0.0
 * @category models
 */
export type PersistOptions<
  Strategy extends PersistStrategy = "provided",
  ColumnName extends string | undefined = string | undefined,
  IndexHints extends ReadonlyArray<IndexHint> | undefined = undefined,
> = {
  readonly columnName?: ColumnName;
  readonly indexHints?: IndexHints;
  readonly valueStrategy?: Strategy;
};

type PersistDescriptorShape<
  TStorageKind extends StorageKind = StorageKind,
  TValueStrategy extends PersistStrategy = PersistStrategy,
  TColumnName extends string | undefined = string | undefined,
  TIndexHints extends ReadonlyArray<IndexHint> | undefined = undefined,
> = {
  readonly storageKind: TStorageKind;
  readonly valueStrategy: TValueStrategy;
} & (TColumnName extends string
  ? {
      readonly columnName: TColumnName;
    }
  : {
      readonly columnName?: never;
    }) &
  (TIndexHints extends ReadonlyArray<IndexHint>
    ? {
        readonly indexHints: TIndexHints;
      }
    : {
        readonly indexHints?: never;
      });

/**
 * Descriptor for one persisted entity field.
 *
 * @since 0.0.0
 * @category models
 */
export type PersistDescriptor<
  TStorageKind extends StorageKind = StorageKind,
  TValueStrategy extends PersistStrategy = PersistStrategy,
  TColumnName extends string | undefined = string | undefined,
  TIndexHints extends ReadonlyArray<IndexHint> | undefined = ReadonlyArray<IndexHint> | undefined,
> = TStorageKind extends StorageKind
  ? TValueStrategy extends PersistStrategy
    ? PersistDescriptorShape<TStorageKind, TValueStrategy, TColumnName, TIndexHints>
    : never
  : never;

/**
 * Companion types for {@link PersistDescriptor}.
 *
 * @example
 * ```ts
 * import type { PersistDescriptor } from "@beep/schema/EntitySchema"
 *
 * declare const descriptor: PersistDescriptor.Any
 * console.log(descriptor.storageKind)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export namespace PersistDescriptor {
  /**
   * Any persistence descriptor value.
   *
   * @since 0.0.0
   * @category models
   */
  export type Any = {
    readonly columnName?: string;
    readonly indexHints?: ReadonlyArray<IndexHint>;
    readonly storageKind: StorageKind;
    readonly valueStrategy: PersistStrategy;
  };
}

const PersistDescriptorFields = {
  columnName: S.optionalKey(S.String),
  indexHints: S.Array(IndexHint).pipe(S.optionalKey),
  valueStrategy: ValueStrategy,
} as const;

const PersistDescriptorCases = {
  blob: PersistDescriptorFields,
  bool: PersistDescriptorFields,
  entityId: PersistDescriptorFields,
  int: PersistDescriptorFields,
  jsonb: PersistDescriptorFields,
  literal: PersistDescriptorFields,
  text: PersistDescriptorFields,
  timestampMillis: PersistDescriptorFields,
} as const;

const PersistDescriptorStorageBase = StorageKind.toTaggedUnion("storageKind")(PersistDescriptorCases);
type PersistDescriptorStatics = Pick<typeof PersistDescriptorStorageBase, "cases" | "guards" | "isAnyOf" | "match">;

const attachPersistDescriptorStatics = <Schema extends S.Decoder<PersistDescriptor.Any>>(
  schema: Schema
): Schema & PersistDescriptorStatics =>
  SchemaUtils.withStatics(schema, () =>
    Struct.pick(PersistDescriptorStorageBase, ["cases", "guards", "isAnyOf", "match"])
  ) as Schema & PersistDescriptorStatics;

/**
 * Schema-backed discriminated persistence descriptor.
 *
 * @since 0.0.0
 * @category schemas
 */
export const PersistDescriptor: S.Decoder<PersistDescriptor.Any> & PersistDescriptorStatics =
  attachPersistDescriptorStatics(
    PersistDescriptorStorageBase.pipe(
      $I.annoteSchema("PersistDescriptor", {
        description: "Schema-backed discriminated persistence descriptor for one entity field.",
      })
    )
  );

/**
 * Persistence descriptor narrowed by storage kind and value strategy.
 *
 * @since 0.0.0
 * @category models
 */
export type PersistDescriptorByValueStrategy<Descriptor extends PersistDescriptor.Any = PersistDescriptor> =
  Descriptor extends unknown
    ? {
        readonly [Kind in Descriptor["storageKind"]]: {
          readonly [Strategy in Descriptor["valueStrategy"]]: Descriptor & {
            readonly storageKind: Kind;
            readonly valueStrategy: Strategy;
          };
        }[Descriptor["valueStrategy"]];
      }[Descriptor["storageKind"]]
    : never;

/**
 * Entity-id schema shape accepted by persisted entity factories.
 *
 * @since 0.0.0
 * @category models
 */
export type EntityIdLike = S.Top & {
  readonly Type: unknown;
  readonly entityType: string;
  readonly tableName: string;
};

/**
 * Numeric encoded entity-id schema.
 *
 * @since 0.0.0
 * @category models
 */
export type EntityIdSchema<Entity extends EntityIdLike> = S.Codec<Entity["Type"], number> & Entity;

type NonNullish<A> = Exclude<A, null | undefined>;
type JsonContainer = object;

type NumericStorage<Encoded> =
  NonNullish<Encoded> extends number ? PersistDescriptor<"entityId" | "int" | "timestampMillis"> : never;

type TextStorage<Encoded> = NonNullish<Encoded> extends string ? PersistDescriptor<"literal" | "text"> : never;

type BoolStorage<Encoded> = NonNullish<Encoded> extends boolean ? PersistDescriptor<"bool"> : never;

type BlobStorage<Encoded> = NonNullish<Encoded> extends Uint8Array ? PersistDescriptor<"blob"> : never;

type JsonStorage<Encoded> = NonNullish<Encoded> extends JsonContainer ? PersistDescriptor<"jsonb"> : never;

type PersistDescriptorForEncoded<Encoded> = undefined extends Encoded
  ? never
  : NumericStorage<Encoded> | TextStorage<Encoded> | BoolStorage<Encoded> | BlobStorage<Encoded> | JsonStorage<Encoded>;

/**
 * Persistence descriptor type permitted for one schema field.
 *
 * @since 0.0.0
 * @category models
 */
export type PersistDescriptorFor<Schema extends S.Top> = Schema["~encoded.optionality"] extends "optional"
  ? never
  : [S.Codec.DecodingServices<Schema>] extends [never]
    ? [S.Codec.EncodingServices<Schema>] extends [never]
      ? PersistDescriptorForEncoded<S.Codec.Encoded<Schema>>
      : never
    : never;

/**
 * Exact persisted descriptor map permitted for a field map.
 *
 * @since 0.0.0
 * @category models
 */
export type PersistedFor<FieldMap extends Fields> = {
  readonly [K in keyof FieldMap]: PersistDescriptorFor<FieldMap[K]>;
};

/**
 * Any persisted descriptor map.
 *
 * @since 0.0.0
 * @category models
 */
export type PersistedMap = Readonly<Record<string, PersistDescriptor>>;

type ExtraPersistedKeys<FieldMap extends Fields, Persisted extends PersistedMap> = Exclude<
  keyof Persisted,
  keyof FieldMap
>;

type NoExtraPersistedKeys<FieldMap extends Fields, Persisted extends PersistedMap> = {
  readonly [K in ExtraPersistedKeys<FieldMap, Persisted>]: never;
};

/**
 * Persisted map that matches a field map and rejects keys outside that field map.
 *
 * @since 0.0.0
 * @category models
 */
export type CheckedPersistedFor<FieldMap extends Fields, Persisted extends PersistedFor<FieldMap>> = Persisted &
  NoExtraPersistedKeys<FieldMap, Persisted>;

/**
 * Entity metadata attached to entity schema classes.
 *
 * @since 0.0.0
 * @category models
 */
export type Definition<
  FieldMap extends Fields = Fields,
  Persisted extends PersistedMap = PersistedMap,
  TableName extends string = string,
  EntityId extends EntityIdLike | undefined = EntityIdLike | undefined,
> = {
  readonly fields: FieldMap;
  readonly persisted: Persisted;
  readonly tableName: TableName;
} & (EntityId extends EntityIdLike
  ? {
      readonly entityId: EntityId;
    }
  : {
      readonly entityId?: never;
    });

/**
 * Encoded persistence row shape for a field map.
 *
 * @since 0.0.0
 * @category models
 */
export type EncodedShape<FieldMap extends Fields> = {
  readonly [K in keyof FieldMap]: S.Codec.Encoded<FieldMap[K]>;
};

/**
 * Decoded domain type shape for a field map.
 *
 * @since 0.0.0
 * @category models
 */
export type TypeShape<FieldMap extends Fields> = {
  readonly [K in keyof FieldMap]: S.Schema.Type<FieldMap[K]>;
};

/**
 * Schema annotation bag accepted by entity class factories.
 *
 * @since 0.0.0
 * @category models
 */
export type SchemaAnnotations = S.Annotations.Annotations;

/**
 * Type-level snake-case transform.
 *
 * @since 0.0.0
 * @category models
 */
export type SnakeCase<Value extends string> = ReturnType<typeof Str.snakeCase<Value>>;

/**
 * Last path segment of an identity string.
 *
 * @since 0.0.0
 * @category models
 */
export type LastPathSegment<Value extends string> = Value extends `${string}/${infer Tail}`
  ? LastPathSegment<Tail>
  : Value;

/**
 * Default table name derived from a schema identifier.
 *
 * @since 0.0.0
 * @category models
 */
export type TableNameFromIdentifier<Identifier extends string> = SnakeCase<LastPathSegment<Identifier>>;

/**
 * Column name for a field key and descriptor.
 *
 * @since 0.0.0
 * @category models
 */
export type ColumnNameFor<Key extends string, Descriptor extends PersistDescriptor> = Descriptor extends {
  readonly columnName: infer ColumnName extends string;
}
  ? ColumnName
  : SnakeCase<Key>;

/**
 * Input accepted by {@link ClassFactory}.
 *
 * @since 0.0.0
 * @category models
 */
export type ClassInput<
  FieldMap extends Fields,
  Persisted extends PersistedFor<FieldMap>,
  TableName extends string = string,
  EntityId extends EntityIdLike | undefined = undefined,
> = {
  readonly entityId?: EntityId;
  readonly fields: FieldMap;
  readonly persisted: CheckedPersistedFor<FieldMap, Persisted>;
  readonly tableName?: TableName;
};

/**
 * Preserve a checked class input while letting callers keep `const` inference.
 *
 * @since 0.0.0
 * @category constructors
 */
export const defineClassInput = <
  const FieldMap extends Fields,
  const Persisted extends PersistedFor<FieldMap>,
  const TableName extends string = string,
  const EntityId extends EntityIdLike | undefined = undefined,
>(
  input: ClassInput<FieldMap, Persisted, TableName, EntityId>
): ClassInput<FieldMap, Persisted, TableName, EntityId> => input;

type VariantFieldFor<
  Field extends S.Top,
  Descriptor extends PersistDescriptor.Any,
> = Descriptor["valueStrategy"] extends "generatedOnInsert"
  ? Model.Generated<Field>
  : Descriptor["valueStrategy"] extends "incrementedOnWrite"
    ? Model.Generated<Field>
    : Descriptor["valueStrategy"] extends "defaultedOnInsert"
      ? Descriptor["storageKind"] extends "timestampMillis"
        ? Model.DateTimeInsertFromNumber
        : Model.GeneratedByApp<Field>
      : Descriptor["valueStrategy"] extends "updatedOnWrite"
        ? Descriptor["storageKind"] extends "timestampMillis"
          ? Model.DateTimeUpdateFromNumber
          : Model.GeneratedByApp<Field>
        : Descriptor["valueStrategy"] extends "providedByContext" | "derived" | "computedByService"
          ? Model.GeneratedByApp<Field>
          : Field;

type VariantFieldsFor<FieldMap extends Fields, Persisted extends PersistedMap> = {
  readonly [K in keyof FieldMap]: K extends keyof Persisted ? VariantFieldFor<FieldMap[K], Persisted[K]> : FieldMap[K];
};

/**
 * Entity schema class produced by {@link ClassFactory}.
 *
 * @since 0.0.0
 * @category models
 */
export type EntityClass<
  Self,
  FieldMap extends Fields,
  Persisted extends PersistedFor<FieldMap>,
  Inherited = {},
  TableName extends string = string,
  EntityId extends EntityIdLike | undefined = EntityIdLike | undefined,
> = S.Codec<Self, EncodedShape<FieldMap>, never, never> &
  Model.ClassShape<Self, VariantFieldsFor<FieldMap, Persisted>, {}, Inherited> & {
    readonly definition: Definition<FieldMap, Persisted, TableName, EntityId>;
  };

/**
 * Companion types for {@link EntityClass}.
 *
 * @example
 * ```ts
 * import type { EntityClass } from "@beep/schema/EntitySchema"
 *
 * declare const entity: EntityClass.Any
 * console.log(entity.definition.tableName)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export namespace EntityClass {
  /**
   * Any entity schema class.
   *
   * @since 0.0.0
   * @category models
   */
  export type Any = S.Top & {
    readonly definition: Definition;
  };

  /**
   * Definition attached to an entity schema class.
   *
   * @since 0.0.0
   * @category models
   */
  export type DefinitionOf<Entity extends Any> = Entity["definition"];
}

/**
 * Assign fields with right-hand override.
 *
 * @since 0.0.0
 * @category models
 */
export type Assign<Base extends Fields, Extension extends Fields> = Simplify<StructAssign<Base, Extension>>;

/**
 * Assign persisted maps with right-hand override.
 *
 * @since 0.0.0
 * @category models
 */
export type AssignPersisted<BasePersisted extends PersistedMap, ExtensionPersisted extends PersistedMap> = Simplify<
  StructAssign<BasePersisted, ExtensionPersisted>
>;

/**
 * Field and persistence maps produced by composing an inherited entity shape
 * with a child entity shape.
 *
 * @since 0.0.0
 * @category models
 */
type AssignedEntityParts<
  BaseFields extends Fields,
  BasePersisted extends PersistedFor<BaseFields>,
  ExtensionFields extends Fields,
  ExtensionPersisted extends PersistedFor<ExtensionFields>,
> = {
  readonly fields: Assign<BaseFields, ExtensionFields>;
  readonly persisted: AssignedPersisted<BaseFields, BasePersisted, ExtensionFields, ExtensionPersisted>;
};

/**
 * Persisted map produced by composing inherited and child entity parts.
 *
 * @since 0.0.0
 * @category models
 */
export type AssignedPersisted<
  BaseFields extends Fields,
  BasePersisted extends PersistedFor<BaseFields>,
  ExtensionFields extends Fields,
  ExtensionPersisted extends PersistedFor<ExtensionFields>,
> = CheckedPersistedFor<
  Assign<BaseFields, ExtensionFields>,
  AssignPersisted<BasePersisted, ExtensionPersisted> & PersistedFor<Assign<BaseFields, ExtensionFields>>
>;

/**
 * Compose field and persistence maps together so their correlation is checked
 * at the call site and preserved for downstream class factories.
 *
 * @since 0.0.0
 * @category constructors
 */
const assignEntityParts = <
  const BaseFields extends Fields,
  const BasePersisted extends PersistedFor<BaseFields>,
  const ExtensionFields extends Fields,
  const ExtensionPersisted extends PersistedFor<ExtensionFields>,
>(
  baseFields: BaseFields,
  basePersisted: BasePersisted,
  extensionFields: ExtensionFields,
  extensionPersisted: ExtensionPersisted
): AssignedEntityParts<BaseFields, BasePersisted, ExtensionFields, ExtensionPersisted> =>
  ({
    fields: Struct.assign(baseFields, extensionFields),
    persisted: Struct.assign(basePersisted, extensionPersisted),
  }) as AssignedEntityParts<BaseFields, BasePersisted, ExtensionFields, ExtensionPersisted>;

/**
 * Class factory with inherited invariant fields.
 *
 * @since 0.0.0
 * @category constructors
 */
export type ClassFactory<
  Self,
  FieldMap extends Fields,
  Persisted extends PersistedFor<FieldMap>,
  TableName extends string = string,
  EntityId extends EntityIdLike | undefined = EntityIdLike | undefined,
> = EntityClass<Self, FieldMap, Persisted, {}, TableName, EntityId> & {
  readonly Class: <Child = never>(
    identifier: string
  ) => <
    const ChildFields extends Fields,
    const ChildPersisted extends PersistedFor<ChildFields>,
    const ChildTableName extends string = string,
    const ChildEntityId extends EntityIdLike | undefined = undefined,
  >(
    input: ClassInput<ChildFields, ChildPersisted, ChildTableName, ChildEntityId>,
    annotations?: SchemaAnnotations
  ) => [Child] extends [never]
    ? "Missing `Child` generic - use `BaseEntity.Class<Child>(...)`"
    : EntityClass<
        Child,
        Assign<FieldMap, ChildFields>,
        AssignedPersisted<FieldMap, Persisted, ChildFields, ChildPersisted>,
        Self,
        ChildTableName,
        ChildEntityId
      >;
};

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
      Struct.assign(base, options?.columnName === undefined ? {} : { columnName: options.columnName }),
      options?.indexHints === undefined ? {} : { indexHints: options.indexHints }
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
 * Treat an entity id schema as a numeric encoded entity id.
 *
 * @since 0.0.0
 * @category constructors
 */
export const entityId = <const Entity extends EntityIdLike>(schema: Entity): EntityIdSchema<Entity> =>
  schema as EntityIdSchema<Entity>;

/**
 * Alias for generated entity id fields.
 *
 * @since 0.0.0
 * @category constructors
 */
export const generatedId = entityId;

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
 * @category naming
 */
export const tableNameFromIdentifier = <const Identifier extends string>(
  identifier: Identifier
): TableNameFromIdentifier<Identifier> =>
  Str.snakeCase(titleSegment(identifier)) as TableNameFromIdentifier<Identifier>;

/**
 * Resolve a column name from field key and descriptor override.
 *
 * @since 0.0.0
 * @category naming
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

class AstAbsence extends S.Class<AstAbsence>($I`AstAbsence`)(
  {
    allowsNull: S.Boolean,
    allowsUndefined: S.Boolean,
    isAmbiguous: S.Boolean,
  },
  $I.annote("AstAbsence", {
    description:
      "Represents the absence of a value in an AST declaration, with options for null, undefined, and ambiguity.",
  })
) {}

const knownAstAbsence = (allowsNull: boolean, allowsUndefined: boolean, isAmbiguous = false): AstAbsence => ({
  allowsNull,
  allowsUndefined,
  isAmbiguous,
});

const combineAstAbsence = (left: AstAbsence, right: AstAbsence): AstAbsence => ({
  allowsNull: left.allowsNull || right.allowsNull,
  allowsUndefined: left.allowsUndefined || right.allowsUndefined,
  isAmbiguous: left.isAmbiguous || right.isAmbiguous,
});

const isJsonDeclaration = (ast: AST.Declaration): boolean => {
  const typeConstructor = ast.annotations?.typeConstructor as
    | {
        readonly _tag?: string;
      }
    | undefined;
  return typeConstructor?._tag === "effect/Json" || typeConstructor?._tag === "effect/MutableJson";
};

const astAbsence = (ast: AST.AST): AstAbsence => {
  switch (ast._tag) {
    case "Null":
      return knownAstAbsence(true, false);
    case "Undefined":
    case "Void":
      return knownAstAbsence(false, true);
    case "Any":
    case "Unknown":
      return knownAstAbsence(true, true);
    case "Declaration":
      return isJsonDeclaration(ast) ? knownAstAbsence(true, false) : knownAstAbsence(false, false, true);
    case "Suspend":
      return astAbsence(ast.thunk());
    case "Union":
      return A.reduce(ast.types ?? [], knownAstAbsence(false, false), (accumulator, member) =>
        combineAstAbsence(accumulator, astAbsence(member))
      );
    default:
      return knownAstAbsence(false, false);
  }
};

/**
 * Encoded absence shape for one schema field.
 *
 * @since 0.0.0
 * @category models
 */
export type EncodedFieldShape = {
  readonly absenceKind: EncodedAbsenceKind;
  readonly allowsNull: boolean;
  readonly allowsUndefined: boolean;
  readonly isAmbiguous: boolean;
  readonly isOptional: boolean;
};

/**
 * Return the encoded AST for a schema field.
 *
 * @since 0.0.0
 * @category ast
 */
export const encodedAstFor = (field: S.Top): AST.AST => AST.toEncoded(field.ast);

const absenceKindFor = (shape: Omit<EncodedFieldShape, "absenceKind">): EncodedAbsenceKind => {
  if (shape.isAmbiguous) {
    return "ambiguous";
  }
  if (shape.isOptional && shape.allowsNull && shape.allowsUndefined) {
    return "optionalNullish";
  }
  if (shape.isOptional && shape.allowsNull) {
    return "optionalNullable";
  }
  if (shape.isOptional && shape.allowsUndefined) {
    return "optionalUndefined";
  }
  if (shape.isOptional) {
    return "optionalKey";
  }
  if (shape.allowsNull && shape.allowsUndefined) {
    return "nullish";
  }
  if (shape.allowsNull) {
    return "nullable";
  }
  if (shape.allowsUndefined) {
    return "undefined";
  }
  return "required";
};

/**
 * Derive encoded nullability and optionality from the encoded schema AST.
 *
 * @since 0.0.0
 * @category ast
 */
export const encodedFieldShape = (field: S.Top): EncodedFieldShape => {
  const ast = encodedAstFor(field);
  const absence = astAbsence(ast);
  const shape = {
    allowsNull: absence.allowsNull,
    allowsUndefined: absence.allowsUndefined,
    isAmbiguous: absence.isAmbiguous,
    isOptional: AST.isOptional(ast),
  };
  return Struct.assign(shape, {
    absenceKind: absenceKindFor(shape),
  });
};

/**
 * Derive and validate selected-row absence semantics for one field.
 *
 * @since 0.0.0
 * @category ast
 */
export const selectedRowFieldShape: {
  (key: string, field: S.Top): EncodedFieldShape;
  (field: S.Top): (key: string) => EncodedFieldShape;
} = dual(2, (key: string, field: S.Top): EncodedFieldShape => {
  const shape = encodedFieldShape(field);
  if (shape.isAmbiguous || shape.isOptional || shape.allowsUndefined) {
    throw new Error(
      `Persisted selected-row field '${key}' must encode SQL absence as null, not undefined, a missing key, or an ambiguous declared schema.`
    );
  }
  return shape;
});

/**
 * True when a field's encoded side allows null.
 *
 * @since 0.0.0
 * @category ast
 */
export const isEncodedNullable = (field: S.Top): boolean => encodedFieldShape(field).allowsNull;

/**
 * True when a field's encoded side is optional.
 *
 * @since 0.0.0
 * @category ast
 */
export const isEncodedOptional = (field: S.Top): boolean => encodedFieldShape(field).isOptional;

const withDefinitionAnnotation = <
  FieldMap extends Fields,
  Persisted extends PersistedFor<FieldMap>,
  TableName extends string,
  EntityId extends EntityIdLike | undefined,
>(
  definition: Definition<FieldMap, Persisted, TableName, EntityId>,
  annotations?: SchemaAnnotations
): SchemaAnnotations => Struct.assign(annotations ?? {}, { [DefinitionAnnotationKey]: definition });

const normalizeDefinition = <
  const FieldMap extends Fields,
  const Persisted extends PersistedFor<FieldMap>,
  const TableName extends string,
  const EntityId extends EntityIdLike | undefined,
>(
  identifier: string,
  input: ClassInput<FieldMap, Persisted, TableName, EntityId>
): Definition<FieldMap, Persisted, TableName, EntityId> =>
  ({
    ...(input.entityId === undefined ? {} : { entityId: input.entityId }),
    fields: input.fields,
    persisted: input.persisted,
    tableName: (input.tableName ?? input.entityId?.tableName ?? tableNameFromIdentifier(identifier)) as TableName,
  }) as unknown as Definition<FieldMap, Persisted, TableName, EntityId>;

const attachDefinition = <
  Class extends object,
  FieldMap extends Fields,
  Persisted extends PersistedFor<FieldMap>,
  TableName extends string,
  EntityId extends EntityIdLike | undefined,
>(
  entityClass: Class,
  definition: Definition<FieldMap, Persisted, TableName, EntityId>
): Class & {
  readonly definition: Definition<FieldMap, Persisted, TableName, EntityId>;
} => {
  Reflect.defineProperty(entityClass, "definition", {
    configurable: false,
    enumerable: true,
    value: definition,
  });
  return entityClass as Class & {
    readonly definition: Definition<FieldMap, Persisted, TableName, EntityId>;
  };
};

const attachEntityClassDefinition = <
  Self,
  const FieldMap extends Fields,
  const Persisted extends PersistedFor<FieldMap>,
  Inherited,
  const TableName extends string,
  const EntityId extends EntityIdLike | undefined,
>(
  entityClass: Model.ClassShape<Self, VariantFieldsFor<FieldMap, Persisted>, {}, Inherited>,
  definition: Definition<FieldMap, Persisted, TableName, EntityId>
): EntityClass<Self, FieldMap, Persisted, Inherited, TableName, EntityId> =>
  attachDefinition(entityClass, definition) as EntityClass<Self, FieldMap, Persisted, Inherited, TableName, EntityId>;

const variantFieldFor = <const Field extends S.Top, const Descriptor extends PersistDescriptor.Any>(
  field: Field,
  descriptor: Descriptor
): VariantFieldFor<Field, Descriptor> =>
  Match.value(descriptor).pipe(
    Match.withReturnType<unknown>(),
    Match.when(
      (self) => self.valueStrategy === "generatedOnInsert" || self.valueStrategy === "incrementedOnWrite",
      () => Model.Generated(field)
    ),
    Match.when(
      (self) => self.valueStrategy === "defaultedOnInsert" && self.storageKind === "timestampMillis",
      () => Model.DateTimeInsertFromNumber
    ),
    Match.when(
      (self) => self.valueStrategy === "updatedOnWrite" && self.storageKind === "timestampMillis",
      () => Model.DateTimeUpdateFromNumber
    ),
    Match.when(
      (self) =>
        self.valueStrategy === "defaultedOnInsert" ||
        self.valueStrategy === "updatedOnWrite" ||
        self.valueStrategy === "providedByContext" ||
        self.valueStrategy === "derived" ||
        self.valueStrategy === "computedByService",
      () => Model.GeneratedByApp(field)
    ),
    Match.orElse(() => field)
  ) as VariantFieldFor<Field, Descriptor>;

const variantFieldsFor = <const FieldMap extends Fields, const Persisted extends PersistedMap>(
  fields: FieldMap,
  persisted: Persisted
): VariantFieldsFor<FieldMap, Persisted> => {
  const output: Record<string, unknown> = {};
  for (const [key, field] of Struct.entries(fields)) {
    output[key] = variantFieldFor(field, persisted[key]);
  }
  return output as VariantFieldsFor<FieldMap, Persisted>;
};

const makeEntityModelClass = <Self, const FieldMap extends Fields, const Persisted extends PersistedFor<FieldMap>>(
  identifier: string,
  fields: VariantFieldsFor<FieldMap, Persisted>,
  annotations?: SchemaAnnotations
): Model.ClassShape<Self, VariantFieldsFor<FieldMap, Persisted>> => {
  const makeClass = Model.Class<Self>(identifier) as unknown as (
    fields: VariantFieldsFor<FieldMap, Persisted>,
    annotations?: SchemaAnnotations
  ) => Model.ClassShape<Self, VariantFieldsFor<FieldMap, Persisted>>;
  return makeClass(fields, annotations);
};

const extendEntityModelClass = <
  Self,
  Child,
  const FieldMap extends Fields,
  const Persisted extends PersistedFor<FieldMap>,
  const ChildFields extends Fields,
  const ChildPersisted extends PersistedFor<ChildFields>,
  const TableName extends string,
  const EntityId extends EntityIdLike | undefined,
>(
  baseClass: EntityClass<Self, FieldMap, Persisted, {}, TableName, EntityId>,
  identifier: string,
  fields: VariantFieldsFor<ChildFields, ChildPersisted>,
  annotations?: SchemaAnnotations
): Model.ClassShape<
  Child,
  VariantFieldsFor<Assign<FieldMap, ChildFields>, AssignedPersisted<FieldMap, Persisted, ChildFields, ChildPersisted>>,
  {},
  Self
> => {
  const extend = baseClass.extend<Child>(identifier) as unknown as (
    fields: VariantFieldsFor<ChildFields, ChildPersisted>,
    annotations?: SchemaAnnotations
  ) => Model.ClassShape<
    Child,
    VariantFieldsFor<
      Assign<FieldMap, ChildFields>,
      AssignedPersisted<FieldMap, Persisted, ChildFields, ChildPersisted>
    >,
    {},
    Self
  >;
  return extend(fields, annotations);
};

const createClass = <
  Self,
  const FieldMap extends Fields,
  const Persisted extends PersistedFor<FieldMap>,
  const TableName extends string,
  const EntityId extends EntityIdLike | undefined,
>(
  identifier: string,
  input: ClassInput<FieldMap, Persisted, TableName, EntityId>,
  annotations?: SchemaAnnotations
): EntityClass<Self, FieldMap, Persisted, {}, TableName, EntityId> => {
  const definition = normalizeDefinition(identifier, input);
  const entityClass = makeEntityModelClass<Self, FieldMap, Persisted>(
    identifier,
    variantFieldsFor(definition.fields, definition.persisted),
    withDefinitionAnnotation(definition, annotations)
  );
  return attachEntityClassDefinition(entityClass, definition);
};

const withClassFactory = <
  Self,
  const FieldMap extends Fields,
  const Persisted extends PersistedFor<FieldMap>,
  const TableName extends string,
  const EntityId extends EntityIdLike | undefined,
>(
  baseClass: EntityClass<Self, FieldMap, Persisted, {}, TableName, EntityId>
): ClassFactory<Self, FieldMap, Persisted, TableName, EntityId> => {
  const Class =
    <Child = never>(identifier: string) =>
    <
      const ChildFields extends Fields,
      const ChildPersisted extends PersistedFor<ChildFields>,
      const ChildTableName extends string = string,
      const ChildEntityId extends EntityIdLike | undefined = undefined,
    >(
      input: ClassInput<ChildFields, ChildPersisted, ChildTableName, ChildEntityId>,
      annotations?: SchemaAnnotations
    ) => {
      const childParts = assignEntityParts(
        baseClass.definition.fields,
        baseClass.definition.persisted,
        input.fields,
        input.persisted
      );
      const childInput = defineClassInput({
        ...(input.entityId === undefined ? {} : { entityId: input.entityId }),
        fields: childParts.fields,
        persisted: childParts.persisted,
        ...(input.tableName === undefined ? {} : { tableName: input.tableName }),
      });
      const childDefinition = normalizeDefinition(identifier, childInput);
      const childClass = extendEntityModelClass<
        Self,
        Child,
        FieldMap,
        Persisted,
        ChildFields,
        ChildPersisted,
        TableName,
        EntityId
      >(
        baseClass,
        identifier,
        variantFieldsFor<ChildFields, ChildPersisted>(input.fields, input.persisted),
        withDefinitionAnnotation(childDefinition, annotations)
      );
      return attachEntityClassDefinition(childClass, childDefinition);
    };

  Reflect.defineProperty(baseClass, "Class", {
    configurable: true,
    value: Class,
  });
  return baseClass as ClassFactory<Self, FieldMap, Persisted, TableName, EntityId>;
};

/**
 * Build an entity schema class factory with invariant fields.
 *
 * @since 0.0.0
 * @category constructors
 */
export const ClassFactory =
  (identifier: string) =>
  <
    const FieldMap extends Fields,
    const Persisted extends PersistedFor<FieldMap>,
    const TableName extends string = string,
    const EntityId extends EntityIdLike | undefined = undefined,
  >(
    input: ClassInput<FieldMap, Persisted, TableName, EntityId>,
    annotations?: SchemaAnnotations
  ): ClassFactory<TypeShape<FieldMap>, FieldMap, Persisted, TableName, EntityId> =>
    withClassFactory(
      createClass<TypeShape<FieldMap>, FieldMap, Persisted, TableName, EntityId>(identifier, input, annotations)
    );

/**
 * Retrieve entity metadata from schema annotations or class statics.
 *
 * @since 0.0.0
 * @category accessors
 */
export const getDefinition = <Entity extends EntityClass.Any>(entity: Entity): EntityClass.DefinitionOf<Entity> => {
  const annotated = entity.ast.annotations?.[DefinitionAnnotationKey];
  return (annotated ?? entity.definition) as EntityClass.DefinitionOf<Entity>;
};
