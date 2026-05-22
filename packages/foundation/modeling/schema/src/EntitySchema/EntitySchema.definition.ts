/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { type Str, Struct } from "@beep/utils";
import type * as S from "effect/Schema";
import type { Simplify, Assign as StructAssign } from "effect/Struct";
import type * as Model from "../Model/index.ts";
import type {
  EntityFieldInput,
  EntityFieldInputs,
  EntityVariantFieldInput,
  Fields,
  SelectedFieldOf,
  SelectedFieldsOf,
} from "./EntitySchema.fields.ts";
import type {
  CheckedPersistedFor,
  EntityIdLike,
  PersistDescriptor,
  PersistedFor,
  PersistedMap,
} from "./EntitySchema.persist.ts";
/**
 * Entity metadata attached to entity schema classes.
 *
 * @since 0.0.0
 * @category models
 */
export type Definition<
  FieldMap extends EntityFieldInputs = EntityFieldInputs,
  SelectedFieldMap extends Fields = SelectedFieldsOf<FieldMap>,
  Persisted extends PersistedMap = PersistedMap,
  TableName extends string = string,
  EntityId extends EntityIdLike | undefined = EntityIdLike | undefined,
> = {
  readonly fields: SelectedFieldMap;
  readonly inputFields: FieldMap;
  readonly persisted: Persisted;
  readonly tableName: TableName;
  readonly variantFields: VariantFieldsFor<FieldMap, Persisted>;
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
export type EncodedShape<FieldMap extends EntityFieldInputs> = {
  readonly [K in keyof FieldMap]: S.Codec.Encoded<SelectedFieldOf<FieldMap[K]>>;
};

/**
 * Decoded domain type shape for a field map.
 *
 * @since 0.0.0
 * @category models
 */
export type TypeShape<FieldMap extends EntityFieldInputs> = {
  readonly [K in keyof FieldMap]: S.Schema.Type<SelectedFieldOf<FieldMap[K]>>;
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
  FieldMap extends EntityFieldInputs,
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
  const FieldMap extends EntityFieldInputs,
  const Persisted extends PersistedFor<FieldMap>,
  const TableName extends string = string,
  const EntityId extends EntityIdLike | undefined = undefined,
>(
  input: ClassInput<FieldMap, Persisted, TableName, EntityId>
): ClassInput<FieldMap, Persisted, TableName, EntityId> => input;

/**
 * Variant field schema selected for a persisted field descriptor.
 *
 * @since 0.0.0
 * @category models
 */
export type VariantFieldFor<
  Field extends S.Top,
  Descriptor extends PersistDescriptor.Any,
> = Descriptor["valueStrategy"] extends "generatedOnInsert"
  ? Model.Generated<Field>
  : Descriptor["valueStrategy"] extends "incrementedOnWrite"
    ? Model.Generated<Field>
    : Descriptor["valueStrategy"] extends "defaultedOnInsert"
      ? Descriptor["storageKind"] extends "timestampMillis"
        ? Model.DateTimeInsertFromNumber
        : Descriptor["storageKind"] extends "timestampDate"
          ? Model.DateTimeInsertFromDate
          : Model.GeneratedByApp<Field>
      : Descriptor["valueStrategy"] extends "updatedOnWrite"
        ? Descriptor["storageKind"] extends "timestampMillis"
          ? Model.DateTimeUpdateFromNumber
          : Descriptor["storageKind"] extends "timestampDate"
            ? Model.DateTimeUpdateFromDate
            : Model.GeneratedByApp<Field>
        : Descriptor["valueStrategy"] extends "providedByContext" | "derived" | "computedByService"
          ? Model.GeneratedByApp<Field>
          : Field;

/**
 * Variant field schema selected for a field input and persisted descriptor.
 *
 * @since 0.0.0
 * @category models
 */
export type VariantFieldForInput<
  Field extends EntityFieldInput,
  Descriptor extends PersistDescriptor.Any,
> = Field extends EntityVariantFieldInput ? Field : VariantFieldFor<SelectedFieldOf<Field>, Descriptor>;

/**
 * Variant field map derived from entity inputs and persistence descriptors.
 *
 * @since 0.0.0
 * @category models
 */
export type VariantFieldsFor<FieldMap extends EntityFieldInputs, Persisted extends PersistedMap> = {
  readonly [K in keyof FieldMap]: K extends keyof Persisted
    ? VariantFieldForInput<FieldMap[K], Persisted[K]>
    : FieldMap[K];
};

/**
 * Entity schema class produced by {@link ClassFactory}.
 *
 * @since 0.0.0
 * @category models
 */
export type EntityClass<
  Self,
  FieldMap extends EntityFieldInputs,
  Persisted extends PersistedFor<FieldMap>,
  Inherited = {},
  TableName extends string = string,
  EntityId extends EntityIdLike | undefined = EntityIdLike | undefined,
> = S.Codec<Self, EncodedShape<FieldMap>, never, never> &
  Model.ClassShape<Self, VariantFieldsFor<FieldMap, Persisted>, {}, Inherited> & {
    readonly definition: Definition<FieldMap, SelectedFieldsOf<FieldMap>, Persisted, TableName, EntityId>;
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
export type Assign<Base extends EntityFieldInputs, Extension extends EntityFieldInputs> = Simplify<
  StructAssign<Base, Extension>
>;

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
export type AssignedEntityParts<
  BaseFields extends EntityFieldInputs,
  BasePersisted extends PersistedMap,
  ExtensionFields extends EntityFieldInputs,
  ExtensionPersisted extends PersistedMap,
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
  BaseFields extends EntityFieldInputs,
  BasePersisted extends PersistedMap,
  ExtensionFields extends EntityFieldInputs,
  ExtensionPersisted extends PersistedMap,
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
export const assignEntityParts = <
  const BaseFields extends EntityFieldInputs,
  const BasePersisted extends PersistedFor<BaseFields>,
  const ExtensionFields extends EntityFieldInputs,
  const ExtensionPersisted extends PersistedMap,
>(input: {
  readonly baseFields: BaseFields;
  readonly basePersisted: BasePersisted;
  readonly extensionFields: ExtensionFields;
  readonly extensionPersisted: ExtensionPersisted;
}): AssignedEntityParts<BaseFields, BasePersisted, ExtensionFields, ExtensionPersisted> =>
  ({
    fields: Struct.assign(input.baseFields, input.extensionFields),
    persisted: Struct.assign(input.basePersisted, input.extensionPersisted),
  }) as AssignedEntityParts<BaseFields, BasePersisted, ExtensionFields, ExtensionPersisted>;
