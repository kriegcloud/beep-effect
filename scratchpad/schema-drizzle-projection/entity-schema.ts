import { $ScratchpadId } from "@beep/identity/packages";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import { Str } from "@beep/utils";
import * as Struct from "@beep/utils/Struct";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";

const $I = $ScratchpadId.create("schema-drizzle-projection/entity-schema");

const DefinitionAnnotationKey = "@beep/scratchpad/schema-drizzle-projection/definition" as const;


export type Fields = Readonly<Record<string, S.Top>>;
export const StorageKind = LiteralKit(
  [
    "entityId",
    "int",
    "jsonb",
    "literal",
    "text",
    "timestampMillis",
  ]
).pipe(
  $I.annoteSchema("StorageKind", {
    description: "The storage kind for a field in the entity schema",
  })
);
export type StorageKind = typeof StorageKind.Type;

export const ValueStrategy = LiteralKit(
  [
    "derived",
    "generatedOnInsert",
    "provided",
  ]
).pipe(
  $I.annoteSchema("PersistStrategy", {
    description: "The strategy for persisting a field in the entity schema",
  })
);
export type ValueStrategy = typeof ValueStrategy.Type;

export const PersistStrategy = ValueStrategy;
export type PersistStrategy = ValueStrategy;

export const EncodedAbsenceKind = LiteralKit(
  [
    "required",
    "nullable",
    "undefined",
    "nullish",
    "optionalKey",
    "optionalNullable",
    "optionalUndefined",
    "optionalNullish",
    "ambiguous",
  ]
).pipe(
  $I.annoteSchema("EncodedAbsenceKind", {
    description: "Classifies how an encoded field represents absence at a persistence boundary.",
  })
);
export type EncodedAbsenceKind = typeof EncodedAbsenceKind.Type;

export type PersistOptions<
  Strategy extends PersistStrategy = "provided",
  ColumnName extends string | undefined = string | undefined,
> = {
  readonly columnName?: ColumnName;
  readonly valueStrategy?: Strategy;
};

type PersistDescriptorShape<
  TStorageKind extends StorageKind = StorageKind,
  TValueStrategy extends PersistStrategy = PersistStrategy,
  TColumnName extends string | undefined = string | undefined,
> = {
  readonly storageKind: TStorageKind;
  readonly valueStrategy: TValueStrategy;
} & (TColumnName extends string ? { readonly columnName: TColumnName } : { readonly columnName?: never });

export type PersistDescriptor<
  TStorageKind extends StorageKind = StorageKind,
  TValueStrategy extends PersistStrategy = PersistStrategy,
  TColumnName extends string | undefined = string | undefined,
> = TStorageKind extends StorageKind
  ? TValueStrategy extends PersistStrategy
    ? PersistDescriptorShape<TStorageKind, TValueStrategy, TColumnName>
    : never
  : never;

export namespace PersistDescriptor {
  export type Any = {
    readonly columnName?: string;
    readonly storageKind: StorageKind;
    readonly valueStrategy: PersistStrategy;
  };
}

const PersistDescriptorFields = {
  columnName: S.optionalKey(S.String),
  valueStrategy: ValueStrategy,
} as const;

const PersistDescriptorCases = {
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

export const PersistDescriptor: S.Decoder<PersistDescriptor.Any> & PersistDescriptorStatics =
  attachPersistDescriptorStatics(
    PersistDescriptorStorageBase.pipe(
      $I.annoteSchema("PersistDescriptor", {
        description: "Schema-backed discriminated persistence descriptor for one entity field.",
      })
    )
  );

export type PersistDescriptorByValueStrategy<
  Descriptor extends PersistDescriptor.Any = PersistDescriptor,
> = Descriptor extends unknown
  ? {
      readonly [Kind in Descriptor["storageKind"]]: {
        readonly [Strategy in Descriptor["valueStrategy"]]: Descriptor & {
          readonly storageKind: Kind;
          readonly valueStrategy: Strategy;
        };
      }[Descriptor["valueStrategy"]];
    }[Descriptor["storageKind"]]
  : never;

export type EntityIdLike = S.Top & {
  readonly Type: unknown;
  readonly entityType: string;
  readonly tableName: string;
};

export type EntityIdSchema<Entity extends EntityIdLike> = S.Codec<Entity["Type"], number> & Entity;

type NonNullish<A> = Exclude<A, null | undefined>;
type JsonContainer = S.JsonArray | S.JsonObject;

type NumericStorage<Encoded> = NonNullish<Encoded> extends number
  ? PersistDescriptor<"entityId" | "int" | "timestampMillis">
  : never;

type TextStorage<Encoded> = NonNullish<Encoded> extends string ? PersistDescriptor<"literal" | "text"> : never;

type JsonStorage<Encoded> = NonNullish<Encoded> extends JsonContainer ? PersistDescriptor<"jsonb"> : never;

type PersistDescriptorForEncoded<Encoded> = undefined extends Encoded
  ? never
  :
      | NumericStorage<Encoded>
      | TextStorage<Encoded>
      | JsonStorage<Encoded>;

export type PersistDescriptorFor<Schema extends S.Top> = Schema["~encoded.optionality"] extends "optional"
  ? never
  : PersistDescriptorForEncoded<S.Codec.Encoded<Schema>>;

export type PersistedFor<FieldMap extends Fields> = {
  readonly [K in keyof FieldMap]: PersistDescriptorFor<FieldMap[K]>;
};

export type PersistedMap = Readonly<Record<string, PersistDescriptor>>;

type ExtraPersistedKeys<FieldMap extends Fields, Persisted extends PersistedMap> = Exclude<
  keyof Persisted,
  keyof FieldMap
>;

type ExactPersistedFor<FieldMap extends Fields, Persisted extends PersistedMap> =
  PersistedFor<FieldMap> & {
    readonly [K in ExtraPersistedKeys<FieldMap, Persisted>]: never;
  };

export type Definition<
  FieldMap extends Fields = Fields,
  Persisted extends PersistedMap = PersistedMap,
  TableName extends string = string,
> = {
  readonly fields: FieldMap;
  readonly persisted: Persisted;
  readonly tableName: TableName;
};

export type EncodedShape<FieldMap extends Fields> = {
  readonly [K in keyof FieldMap]: S.Codec.Encoded<FieldMap[K]>;
};

export type TypeShape<FieldMap extends Fields> = {
  readonly [K in keyof FieldMap]: S.Schema.Type<FieldMap[K]>;
};

export type SchemaAnnotations = S.Annotations.Annotations;

export type SnakeCase<Value extends string> = ReturnType<typeof Str.snakeCase<Value>>;

export type LastPathSegment<Value extends string> = Value extends `${string}/${infer Tail}` ? LastPathSegment<Tail> : Value;

export type TableNameFromIdentifier<Identifier extends string> = SnakeCase<LastPathSegment<Identifier>>;

export type ColumnNameFor<Key extends string, Descriptor extends PersistDescriptor> = Descriptor extends {
  readonly columnName: infer ColumnName extends string;
}
  ? ColumnName
  : SnakeCase<Key>;

export type ClassInput<
  FieldMap extends Fields,
  Persisted extends PersistedMap,
  TableName extends string = string,
> = {
  readonly fields: FieldMap;
  readonly persisted: Persisted & ExactPersistedFor<FieldMap, Persisted>;
  readonly tableName?: TableName;
};

export type EntityClass<
  Self,
  FieldMap extends Fields,
  Persisted extends PersistedMap,
  Inherited = {},
  TableName extends string = string,
> = S.Class<Self, S.Struct<FieldMap>, Inherited> & {
  readonly definition: Definition<FieldMap, Persisted, TableName>;
};

export namespace EntityClass {
  export type Any = S.Top & {
    readonly definition: Definition;
  };

  export type DefinitionOf<Entity extends Any> = Entity["definition"];
}

export type Assign<Base extends Fields, Extension extends Fields> = Omit<Base, keyof Extension> & Extension;

export type AssignPersisted<BasePersisted extends PersistedMap, ExtensionPersisted extends PersistedMap> =
  Omit<BasePersisted, keyof ExtensionPersisted> & ExtensionPersisted;

export type ClassFactory<
  Self,
  FieldMap extends Fields,
  Persisted extends PersistedMap,
  TableName extends string = string,
> = EntityClass<Self, FieldMap, Persisted, {}, TableName> & {
  readonly Class: <Child = never>(
    identifier: string
  ) => <
    const ChildFields extends Fields,
    const ChildPersisted extends PersistedFor<ChildFields>,
    const ChildTableName extends string = string,
  >(
    input: ClassInput<ChildFields, ChildPersisted, ChildTableName>,
    annotations?: SchemaAnnotations
  ) => [Child] extends [never]
    ? "Missing `Child` generic - use `BaseEntity.Class<Child>(...)`"
    : EntityClass<Child, Assign<FieldMap, ChildFields>, AssignPersisted<Persisted, ChildPersisted>, Self, ChildTableName>;
};

const descriptor =
  <const TStorageKind extends StorageKind>(storageKind: TStorageKind) =>
  <const Strategy extends PersistStrategy = "provided", const ColumnName extends string | undefined = undefined>(
    options?: PersistOptions<Strategy, ColumnName>
  ): PersistDescriptor<TStorageKind, Strategy, ColumnName> =>
    Struct.assign(
      {
        storageKind,
        valueStrategy: options?.valueStrategy ?? ("provided" as Strategy),
      },
      options?.columnName === undefined ? {} : { columnName: options.columnName }
    ) as unknown as PersistDescriptor<TStorageKind, Strategy, ColumnName>;

export const persist = {
  entityId: descriptor("entityId"),
  int: descriptor("int"),
  jsonb: descriptor("jsonb"),
  literal: descriptor("literal"),
  text: descriptor("text"),
  timestampMillis: descriptor("timestampMillis"),
} as const;

export const DateTimeFromMillis = S.DateTimeUtcFromMillis;

export const int = S.Int;

export const entityId = <const Entity extends EntityIdLike>(schema: Entity): EntityIdSchema<Entity> =>
  schema as EntityIdSchema<Entity>;

export const generatedId = entityId;

export const literal = <const Value extends string | number | boolean | bigint>(
  value: Value
): S.Literal<Value> => S.Literal(value);

const titleSegment = <const Identifier extends string>(identifier: Identifier): LastPathSegment<Identifier> =>
  A.lastNonEmpty(Str.split(identifier, "/")) as LastPathSegment<Identifier>;

export const tableNameFromIdentifier = <const Identifier extends string>(
  identifier: Identifier
): TableNameFromIdentifier<Identifier> =>
  Str.snakeCase(titleSegment(identifier)) as TableNameFromIdentifier<Identifier>;

export const columnNameFor = <const Key extends string, const Descriptor extends PersistDescriptor>(
  key: Key,
  descriptor: Descriptor
): ColumnNameFor<Key, Descriptor> =>
  (descriptor.columnName ?? Str.snakeCase(key)) as ColumnNameFor<Key, Descriptor>;

type AstAbsence = {
  readonly allowsNull: boolean;
  readonly allowsUndefined: boolean;
  readonly isAmbiguous: boolean;
};

const knownAstAbsence = (
  allowsNull: boolean,
  allowsUndefined: boolean,
  isAmbiguous = false
): AstAbsence => ({
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
  const typeConstructor = ast.annotations?.typeConstructor as { readonly _tag?: string } | undefined;
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

export type EncodedFieldShape = {
  readonly allowsNull: boolean;
  readonly allowsUndefined: boolean;
  readonly absenceKind: EncodedAbsenceKind;
  readonly isAmbiguous: boolean;
  readonly isOptional: boolean;
};

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

export const selectedRowFieldShape = (key: string, field: S.Top): EncodedFieldShape => {
  const shape = encodedFieldShape(field);
  if (shape.isAmbiguous || shape.isOptional || shape.allowsUndefined) {
    throw new Error(
      `Persisted selected-row field '${key}' must encode SQL absence as null, not undefined, a missing key, or an ambiguous declared schema.`
    );
  }
  return shape;
};

export const isEncodedNullable = (field: S.Top): boolean => encodedFieldShape(field).allowsNull;

export const isEncodedOptional = (field: S.Top): boolean => encodedFieldShape(field).isOptional;

const withDefinitionAnnotation = <
  FieldMap extends Fields,
  Persisted extends PersistedMap,
  TableName extends string,
>(
  definition: Definition<FieldMap, Persisted, TableName>,
  annotations?: SchemaAnnotations
): SchemaAnnotations => Struct.assign(annotations ?? {}, { [DefinitionAnnotationKey]: definition });

const normalizeDefinition = <
  const FieldMap extends Fields,
  const Persisted extends PersistedMap,
  const TableName extends string,
>(
  identifier: string,
  input: ClassInput<FieldMap, Persisted, TableName>
): Definition<FieldMap, Persisted, TableName> =>
  ({
    fields: input.fields,
    persisted: input.persisted,
    tableName: (input.tableName ?? tableNameFromIdentifier(identifier)) as TableName,
  }) as Definition<FieldMap, Persisted, TableName>;

const attachDefinition = <
  Class extends object,
  FieldMap extends Fields,
  Persisted extends PersistedMap,
  TableName extends string,
>(
  entityClass: Class,
  definition: Definition<FieldMap, Persisted, TableName>
): Class & { readonly definition: Definition<FieldMap, Persisted, TableName> } => {
  Reflect.defineProperty(entityClass, "definition", {
    configurable: false,
    enumerable: true,
    value: definition,
  });
  return entityClass as Class & { readonly definition: Definition<FieldMap, Persisted, TableName> };
};

const createClass = <
  Self,
  const FieldMap extends Fields,
  const Persisted extends PersistedFor<FieldMap>,
  const TableName extends string,
>(
  identifier: string,
  input: ClassInput<FieldMap, Persisted, TableName>,
  annotations?: SchemaAnnotations
): EntityClass<Self, FieldMap, Persisted, {}, TableName> => {
  const definition = normalizeDefinition(identifier, input);
  const makeClass = S.Class<Self>(identifier) as unknown as (
    fields: FieldMap,
    annotations?: SchemaAnnotations
  ) => S.Class<Self, S.Struct<FieldMap>, {}>;
  const entityClass = makeClass(definition.fields, withDefinitionAnnotation(definition, annotations));
  return attachDefinition(entityClass, definition) as EntityClass<Self, FieldMap, Persisted, {}, TableName>;
};

const withClassFactory = <
  Self,
  const FieldMap extends Fields,
  const Persisted extends PersistedMap,
  const TableName extends string,
>(
  baseClass: EntityClass<Self, FieldMap, Persisted, {}, TableName>
): ClassFactory<Self, FieldMap, Persisted, TableName> => {
  const Class = <Child = never>(identifier: string) =>
    <
      const ChildFields extends Fields,
      const ChildPersisted extends PersistedFor<ChildFields>,
      const ChildTableName extends string = string,
    >(
      input: ClassInput<ChildFields, ChildPersisted, ChildTableName>,
      annotations?: SchemaAnnotations
    ) => {
      const childDefinition = normalizeDefinition(identifier, {
        fields: Struct.assign(baseClass.definition.fields, input.fields),
        persisted: Struct.assign(baseClass.definition.persisted, input.persisted),
        tableName: input.tableName,
      } as ClassInput<Assign<FieldMap, ChildFields>, AssignPersisted<Persisted, ChildPersisted>, ChildTableName>);
      const extend = baseClass.extend<Child>(identifier) as unknown as (
        fields: ChildFields,
        annotations?: SchemaAnnotations
      ) => S.Class<Child, S.Struct<Assign<FieldMap, ChildFields>>, Self>;
      const childClass = extend(input.fields, withDefinitionAnnotation(childDefinition, annotations));
      return attachDefinition(childClass, childDefinition);
    };

  return Struct.assign(baseClass, { Class }) as ClassFactory<Self, FieldMap, Persisted, TableName>;
};

export const ClassFactory =
  (identifier: string) =>
  <
    const FieldMap extends Fields,
    const Persisted extends PersistedFor<FieldMap>,
    const TableName extends string = string,
  >(
    input: ClassInput<FieldMap, Persisted, TableName>,
    annotations?: SchemaAnnotations
  ): ClassFactory<TypeShape<FieldMap>, FieldMap, Persisted, TableName> =>
    withClassFactory(createClass<TypeShape<FieldMap>, FieldMap, Persisted, TableName>(identifier, input, annotations));

export const getDefinition = <Entity extends EntityClass.Any>(entity: Entity): EntityClass.DefinitionOf<Entity> => {
  const annotated = entity.ast.annotations?.[DefinitionAnnotationKey];
  return (annotated ?? entity.definition) as EntityClass.DefinitionOf<Entity>;
};
