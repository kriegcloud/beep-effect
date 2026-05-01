/**
 * First-class storage-neutral entity mixin contracts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity/packages";
import { LiteralKit, SchemaUtils, TaggedErrorClass } from "@beep/schema";
import type * as VariantSchema from "@beep/schema/VariantSchema";
import type { TUtils } from "@beep/types";
import * as Struct from "@beep/utils/Struct";
import * as A from "effect/Array";
import { dual, flow, pipe } from "effect/Function";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import type * as SchemaIssue from "effect/SchemaIssue";
import * as Str from "effect/String";

const $I = $SharedDomainId.create("entity/EntityMixin");

/**
 * Type id marker for entity mixin contract objects.
 *
 * @example
 * ```ts
 * import { TypeId } from "@beep/shared-domain/entity/EntityMixin"
 *
 * console.log(TypeId)
 * ```
 *
 * @since 0.0.0
 * @category symbols
 */
export const TypeId = "@beep/shared-domain/EntityMixin" as const;

/**
 * Type id marker for packed entity mixins.
 *
 * @example
 * ```ts
 * import { PackTypeId } from "@beep/shared-domain/entity/EntityMixin"
 *
 * console.log(PackTypeId)
 * ```
 *
 * @since 0.0.0
 * @category symbols
 */
export const PackTypeId = "@beep/shared-domain/EntityMixin/Pack" as const;

/**
 * Type id marker for explicit field overrides.
 *
 * @example
 * ```ts
 * import { OverrideTypeId } from "@beep/shared-domain/entity/EntityMixin"
 *
 * console.log(OverrideTypeId)
 * ```
 *
 * @since 0.0.0
 * @category symbols
 */
export const OverrideTypeId = "@beep/shared-domain/EntityMixin/Override" as const;

/**
 * Storage recipe vocabulary understood by shared table constructors.
 *
 * @example
 * ```ts
 * import { StorageKind } from "@beep/shared-domain/entity/EntityMixin"
 *
 * console.log(StorageKind.is.entityId("entityId"))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const StorageKind = LiteralKit([
  "blob",
  "bool",
  "encryptionKeyId",
  "entityId",
  "entityRef",
  "hybridLogicalClock",
  "int",
  "json",
  "literal",
  "principal",
  "semanticVersion",
  "sha256",
  "signature",
  "text",
  "timestampMillis",
  "vectorClock",
]).annotate(
  $I.annote("StorageKind", {
    description: "Storage recipe vocabulary understood by shared table constructors.",
  })
);

/**
 * Runtime type for {@link StorageKind}.
 *
 * @example
 * ```ts
 * import type { StorageKind } from "@beep/shared-domain/entity/EntityMixin"
 *
 * const kind: StorageKind = "entityId"
 * console.log(kind)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type StorageKind = typeof StorageKind.Type;

/**
 * Value lifecycle strategy vocabulary used by model and table constructors.
 *
 * @example
 * ```ts
 * import { ValueStrategy } from "@beep/shared-domain/entity/EntityMixin"
 *
 * console.log(ValueStrategy.is.provided("provided"))
 * ```
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
]).annotate(
  $I.annote("ValueStrategy", {
    description: "Value lifecycle strategy vocabulary used by model and table constructors.",
  })
);

/**
 * Runtime type for {@link ValueStrategy}.
 *
 * @example
 * ```ts
 * import type { ValueStrategy } from "@beep/shared-domain/entity/EntityMixin"
 *
 * const strategy: ValueStrategy = "provided"
 * console.log(strategy)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ValueStrategy = typeof ValueStrategy.Type;

/**
 * Symbolic index hint kind carried by storage-neutral mixin descriptors.
 *
 * @example
 * ```ts
 * import { IndexHintKind } from "@beep/shared-domain/entity/EntityMixin"
 *
 * console.log(IndexHintKind.is.lookup("lookup"))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const IndexHintKind = LiteralKit(["btree", "gin", "hash", "lookup", "unique"]).annotate(
  $I.annote("IndexHintKind", {
    description: "Symbolic index hint kind carried by storage-neutral entity field descriptors.",
  })
);

/**
 * Runtime type for {@link IndexHintKind}.
 *
 * @example
 * ```ts
 * import type { IndexHintKind } from "@beep/shared-domain/entity/EntityMixin"
 *
 * const hint: IndexHintKind = "lookup"
 * console.log(hint)
 * ```
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
    description: "Tagged symbolic index hint carried by storage-neutral entity field descriptors.",
  })
);

/**
 * Symbolic index hint carried by storage-neutral mixin descriptors.
 *
 * @example
 * ```ts
 * import { IndexHint } from "@beep/shared-domain/entity/EntityMixin"
 *
 * console.log(IndexHint.lookup.kind)
 * ```
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
 * @example
 * ```ts
 * import type { IndexHint } from "@beep/shared-domain/entity/EntityMixin"
 *
 * const hint: IndexHint = { kind: "lookup" }
 * console.log(hint.kind)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type IndexHint = typeof IndexHint.Type;

/**
 * Descriptor for one field contributed by a mixin or BaseEntity.
 *
 * @example
 * ```ts
 * import type { FieldDescriptor } from "@beep/shared-domain/entity/EntityMixin"
 *
 * const descriptor: FieldDescriptor = {
 *   key: "source",
 *   columnName: "source",
 *   description: "Source kind.",
 *   nullable: false,
 *   storageKind: "literal",
 *   valueStrategy: "derived",
 * }
 * console.log(descriptor.key)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
const IndexHints = S.Array(IndexHint).pipe(S.optionalKey);

class IndexHintField extends S.Class<IndexHintField>($I`IndexHintField`)(
  {
    indexHints: IndexHints,
  },
  $I.annote("IndexHintField", {
    description: "Optional index hints shared by storage-neutral entity field descriptor shapes.",
  })
) {}

const FieldDescriptorFields = {
  columnName: S.String,
  description: S.String,
  indexHints: IndexHints,
  key: S.String,
  nullable: S.Boolean,
} as const;

const FieldDescriptorInputFields = {
  columnName: S.String,
  description: S.String,
  indexHints: IndexHints,
  nullable: S.Boolean,
} as const;

type FieldDescriptorShape<
  Kind extends StorageKind = StorageKind,
  Strategy extends ValueStrategy = ValueStrategy,
> = IndexHintField & {
  readonly columnName: string;
  readonly description: string;
  readonly key: string;
  readonly nullable: boolean;
  readonly storageKind: Kind;
  readonly valueStrategy: Strategy;
};

/**
 * Runtime type for {@link FieldDescriptor}.
 *
 * @example
 * ```ts
 * import type { FieldDescriptor } from "@beep/shared-domain/entity/EntityMixin"
 *
 * const descriptor: FieldDescriptor = {
 *   columnName: "source",
 *   description: "Source kind.",
 *   key: "source",
 *   nullable: false,
 *   storageKind: "literal",
 *   valueStrategy: "derived",
 * }
 * console.log(descriptor.storageKind)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type FieldDescriptor = {
  readonly [Kind in StorageKind]: {
    readonly [Strategy in ValueStrategy]: FieldDescriptorShape<Kind, Strategy>;
  }[ValueStrategy];
}[StorageKind];

/**
 * Literal-preserving descriptor input shape used by {@link make}.
 *
 * @example
 * ```ts
 * import { FieldDescriptorInputShape } from "@beep/shared-domain/entity/EntityMixin"
 *
 * void FieldDescriptorInputShape
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class FieldDescriptorInputShape extends S.Class<FieldDescriptorInputShape>($I`FieldDescriptorInputShape`)(
  {
    columnName: S.String,
    description: S.String,
    indexHints: IndexHints,
    nullable: S.Boolean,
    storageKind: StorageKind,
    valueStrategy: ValueStrategy,
  },
  $I.annote("FieldDescriptorInputShape", {
    description: "Literal-preserving descriptor input shape used to define entity mixin fields.",
  })
) {}

/**
 * Runtime type for {@link FieldDescriptorInput}.
 *
 * @example
 * ```ts
 * import type { FieldDescriptorInput } from "@beep/shared-domain/entity/EntityMixin"
 *
 * const descriptor: FieldDescriptorInput = {
 *   columnName: "source",
 *   description: "Source kind.",
 *   nullable: false,
 *   storageKind: "literal",
 *   valueStrategy: "derived",
 * }
 * console.log(descriptor.storageKind)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type FieldDescriptorInput = {
  readonly [Kind in StorageKind]: {
    readonly [Strategy in ValueStrategy]: Omit<FieldDescriptorShape<Kind, Strategy>, "key">;
  }[ValueStrategy];
}[StorageKind];

const fieldDescriptorFieldsFor = <const Kind extends StorageKind>(storageKind: Kind) =>
  ValueStrategy.toTaggedUnion("valueStrategy")({
    computedByService: Struct.assign(FieldDescriptorFields, { storageKind: S.tag(storageKind) }),
    defaultedOnInsert: Struct.assign(FieldDescriptorFields, { storageKind: S.tag(storageKind) }),
    derived: Struct.assign(FieldDescriptorFields, { storageKind: S.tag(storageKind) }),
    generatedOnInsert: Struct.assign(FieldDescriptorFields, { storageKind: S.tag(storageKind) }),
    incrementedOnWrite: Struct.assign(FieldDescriptorFields, { storageKind: S.tag(storageKind) }),
    provided: Struct.assign(FieldDescriptorFields, { storageKind: S.tag(storageKind) }),
    providedByContext: Struct.assign(FieldDescriptorFields, { storageKind: S.tag(storageKind) }),
    updatedOnWrite: Struct.assign(FieldDescriptorFields, { storageKind: S.tag(storageKind) }),
  });

const fieldDescriptorInputFieldsFor = <const Kind extends StorageKind>(storageKind: Kind) =>
  ValueStrategy.toTaggedUnion("valueStrategy")({
    computedByService: Struct.assign(FieldDescriptorInputFields, { storageKind: S.tag(storageKind) }),
    defaultedOnInsert: Struct.assign(FieldDescriptorInputFields, { storageKind: S.tag(storageKind) }),
    derived: Struct.assign(FieldDescriptorInputFields, { storageKind: S.tag(storageKind) }),
    generatedOnInsert: Struct.assign(FieldDescriptorInputFields, { storageKind: S.tag(storageKind) }),
    incrementedOnWrite: Struct.assign(FieldDescriptorInputFields, { storageKind: S.tag(storageKind) }),
    provided: Struct.assign(FieldDescriptorInputFields, { storageKind: S.tag(storageKind) }),
    providedByContext: Struct.assign(FieldDescriptorInputFields, { storageKind: S.tag(storageKind) }),
    updatedOnWrite: Struct.assign(FieldDescriptorInputFields, { storageKind: S.tag(storageKind) }),
  });

const FieldDescriptorCases = {
  blob: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  bool: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  encryptionKeyId: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  entityId: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  entityRef: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  hybridLogicalClock: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  int: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  json: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  literal: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  principal: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  semanticVersion: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  sha256: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  signature: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  text: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  timestampMillis: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
  vectorClock: Struct.assign(FieldDescriptorFields, { valueStrategy: ValueStrategy }),
} as const;

const FieldDescriptorInputCases = {
  blob: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  bool: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  encryptionKeyId: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  entityId: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  entityRef: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  hybridLogicalClock: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  int: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  json: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  literal: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  principal: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  semanticVersion: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  sha256: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  signature: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  text: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  timestampMillis: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
  vectorClock: Struct.assign(FieldDescriptorInputFields, { valueStrategy: ValueStrategy }),
} as const;

const FieldDescriptorStorageBase = StorageKind.toTaggedUnion("storageKind")(FieldDescriptorCases);
type FieldDescriptorStatics = Pick<typeof FieldDescriptorStorageBase, "cases" | "guards" | "isAnyOf" | "match">;

const FieldDescriptorBase = S.Union([
  fieldDescriptorFieldsFor("blob"),
  fieldDescriptorFieldsFor("bool"),
  fieldDescriptorFieldsFor("encryptionKeyId"),
  fieldDescriptorFieldsFor("entityId"),
  fieldDescriptorFieldsFor("entityRef"),
  fieldDescriptorFieldsFor("hybridLogicalClock"),
  fieldDescriptorFieldsFor("int"),
  fieldDescriptorFieldsFor("json"),
  fieldDescriptorFieldsFor("literal"),
  fieldDescriptorFieldsFor("principal"),
  fieldDescriptorFieldsFor("semanticVersion"),
  fieldDescriptorFieldsFor("sha256"),
  fieldDescriptorFieldsFor("signature"),
  fieldDescriptorFieldsFor("text"),
  fieldDescriptorFieldsFor("timestampMillis"),
  fieldDescriptorFieldsFor("vectorClock"),
]);

/**
 * Storage-neutral schema for materialized field descriptors.
 *
 * @example
 * ```ts
 * import { FieldDescriptor } from "@beep/shared-domain/entity/EntityMixin"
 *
 * void FieldDescriptor
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
const attachFieldDescriptorStatics = <Schema extends S.Decoder<FieldDescriptor>>(
  schema: Schema
): Schema & FieldDescriptorStatics =>
  SchemaUtils.withStatics(schema, () =>
    Struct.pick(FieldDescriptorStorageBase, ["cases", "guards", "isAnyOf", "match"])
  ) as Schema & FieldDescriptorStatics;

/**
 * Storage-neutral schema for materialized field descriptors.
 *
 * @example
 * ```ts
 * import { FieldDescriptor } from "@beep/shared-domain/entity/EntityMixin"
 *
 * void FieldDescriptor
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FieldDescriptor: S.Decoder<FieldDescriptor> & FieldDescriptorStatics = attachFieldDescriptorStatics(
  FieldDescriptorBase.pipe(
    $I.annoteSchema("FieldDescriptor", {
      description: "Storage-neutral tagged descriptor for one entity field.",
    })
  )
);

const FieldDescriptorInputStorageBase = StorageKind.toTaggedUnion("storageKind")(FieldDescriptorInputCases);
type FieldDescriptorInputStatics = Pick<
  typeof FieldDescriptorInputStorageBase,
  "cases" | "guards" | "isAnyOf" | "match"
>;

const FieldDescriptorInputBase = S.Union([
  fieldDescriptorInputFieldsFor("blob"),
  fieldDescriptorInputFieldsFor("bool"),
  fieldDescriptorInputFieldsFor("encryptionKeyId"),
  fieldDescriptorInputFieldsFor("entityId"),
  fieldDescriptorInputFieldsFor("entityRef"),
  fieldDescriptorInputFieldsFor("hybridLogicalClock"),
  fieldDescriptorInputFieldsFor("int"),
  fieldDescriptorInputFieldsFor("json"),
  fieldDescriptorInputFieldsFor("literal"),
  fieldDescriptorInputFieldsFor("principal"),
  fieldDescriptorInputFieldsFor("semanticVersion"),
  fieldDescriptorInputFieldsFor("sha256"),
  fieldDescriptorInputFieldsFor("signature"),
  fieldDescriptorInputFieldsFor("text"),
  fieldDescriptorInputFieldsFor("timestampMillis"),
  fieldDescriptorInputFieldsFor("vectorClock"),
]);

/**
 * Storage-neutral schema for field descriptor inputs.
 *
 * @example
 * ```ts
 * import { FieldDescriptorInput } from "@beep/shared-domain/entity/EntityMixin"
 *
 * void FieldDescriptorInput
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
const attachFieldDescriptorInputStatics = <Schema extends S.Decoder<FieldDescriptorInput>>(
  schema: Schema
): Schema & FieldDescriptorInputStatics =>
  SchemaUtils.withStatics(schema, () =>
    Struct.pick(FieldDescriptorInputStorageBase, ["cases", "guards", "isAnyOf", "match"])
  ) as Schema & FieldDescriptorInputStatics;

/**
 * Storage-neutral schema for field descriptor inputs.
 *
 * @example
 * ```ts
 * import { FieldDescriptorInput } from "@beep/shared-domain/entity/EntityMixin"
 *
 * void FieldDescriptorInput
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FieldDescriptorInput: S.Decoder<FieldDescriptorInput> & FieldDescriptorInputStatics =
  attachFieldDescriptorInputStatics(
    FieldDescriptorInputBase.pipe(
      $I.annoteSchema("FieldDescriptorInput", {
        description: "Storage-neutral tagged descriptor input keyed externally by an entity field name.",
      })
    )
  );

/**
 * Descriptor refinement that materializes `valueStrategy` as a discriminated
 * union for consumers that need nested strategy-aware narrowing.
 *
 * @example
 * ```ts
 * import type { FieldDescriptorByValueStrategy } from "@beep/shared-domain/entity/EntityMixin"
 *
 * type Descriptor = FieldDescriptorByValueStrategy
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type FieldDescriptorByValueStrategy<
  Descriptor extends { readonly storageKind: StorageKind; readonly valueStrategy: ValueStrategy } = FieldDescriptor,
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

type OptionalIndexHints<Input extends FieldDescriptorInputShape> = Input extends {
  readonly indexHints: infer Hints extends ReadonlyArray<IndexHint>;
}
  ? { readonly indexHints: Hints }
  : {};

/**
 * Literal-preserving field descriptor materialized from keyed descriptor input.
 *
 * @example
 * ```ts
 * import type {
 *   FieldDescriptorFromInput,
 *   FieldDescriptorInputShape,
 * } from "@beep/shared-domain/entity/EntityMixin"
 *
 * type Descriptor = FieldDescriptorFromInput<"name", FieldDescriptorInputShape>
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type FieldDescriptorFromInput<
  Key extends string,
  Input extends FieldDescriptorInputShape,
> = FieldDescriptorByValueStrategy<
  {
    readonly columnName: Input["columnName"];
    readonly description: Input["description"];
    readonly key: Key;
    readonly nullable: Input["nullable"];
    readonly storageKind: Input["storageKind"];
    readonly valueStrategy: Input["valueStrategy"];
  } & OptionalIndexHints<Input>
>;

/**
 * Descriptor map keyed by field names.
 *
 * @example
 * ```ts
 * import type { FieldDescriptorMap } from "@beep/shared-domain/entity/EntityMixin"
 *
 * type Map = FieldDescriptorMap
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type FieldDescriptorMap<Fields extends object = VariantSchema.Struct.Fields> = {
  readonly [K in keyof Fields & string]: FieldDescriptor;
};

/**
 * Descriptor input map keyed by field names.
 *
 * @example
 * ```ts
 * import type { FieldDescriptorInputMap } from "@beep/shared-domain/entity/EntityMixin"
 *
 * type Map = FieldDescriptorInputMap
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type FieldDescriptorInputMap<Fields extends object = VariantSchema.Struct.Fields> = {
  readonly [K in keyof Fields & string]: FieldDescriptorInputShape;
};

/**
 * Descriptor map materialized from a literal-preserving definition.
 *
 * @example
 * ```ts
 * import type {
 *   Definition,
 *   FieldDescriptorMapFromDefinition,
 * } from "@beep/shared-domain/entity/EntityMixin"
 * import * as S from "effect/Schema"
 *
 * type Fields = { readonly name: typeof S.String }
 * type Map = FieldDescriptorMapFromDefinition<Fields, Definition<Fields>>
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type FieldDescriptorMapFromDefinition<Fields extends object, Def extends Definition<Fields>> = {
  readonly [K in keyof Fields & keyof Def["fields"] & string]: FieldDescriptorFromInput<K, Def["fields"][K]>;
};

/**
 * Any descriptor map keyed by field names.
 *
 * @example
 * ```ts
 * import type { AnyFieldDescriptorMap } from "@beep/shared-domain/entity/EntityMixin"
 *
 * type Map = AnyFieldDescriptorMap
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type AnyFieldDescriptorMap = object;

/**
 * Definition metadata required to build an entity mixin.
 *
 * @example
 * ```ts
 * import type { Definition } from "@beep/shared-domain/entity/EntityMixin"
 *
 * type MixinDefinition = Definition
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Definition<
  Fields extends object = VariantSchema.Struct.Fields,
  FieldDefinitions extends FieldDescriptorInputMap<Fields> = FieldDescriptorInputMap<Fields>,
> = {
  readonly description: string;
  readonly fields: FieldDefinitions;
};

/**
 * Explicit field override wrapper.
 *
 * @example
 * ```ts
 * import type { FieldOverride } from "@beep/shared-domain/entity/EntityMixin"
 *
 * type Override = FieldOverride<string>
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type FieldOverride<Field> = {
  readonly [OverrideTypeId]: typeof OverrideTypeId;
  readonly field: Field;
  readonly reason: string;
};

type FieldValue = VariantSchema.Struct.Fields[string];
type FieldInputMap = {
  readonly [key: string]: FieldOverride<FieldValue> | FieldValue | undefined;
};

type UnwrapField<Field> = Field extends FieldOverride<infer Inner> ? Inner : Field;
type UnwrapFieldOverrides<Fields extends object> = {
  readonly [K in keyof Fields]: UnwrapField<Fields[K]>;
};

/**
 * Entity mixin contract object.
 *
 * @example
 * ```ts
 * import type { EntityMixin } from "@beep/shared-domain/entity/EntityMixin"
 *
 * type Mixin = EntityMixin
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type EntityMixin<
  Fields extends FieldInputMap = FieldInputMap,
  Def extends Definition<Fields> = Definition<Fields>,
> = {
  readonly [TypeId]: typeof TypeId;
  readonly definition: Def;
  readonly fieldKeys: ReadonlyArray<keyof Fields & string>;
  readonly fieldMap: FieldDescriptorMapFromDefinition<Fields, Def>;
  readonly fields: Fields;
  readonly identifier: string;
  readonly name: string;
};

type MergeObjects<Left extends object, Right extends object> = TUtils.Simplify<Omit<Left, keyof Right> & Right>;
type ObjectIntersection<Union> =
  TUtils.UnionToIntersection<Union> extends infer Intersection extends object ? Intersection : {};

type MixinFields<Mixins extends ReadonlyArray<EntityMixin>, Acc extends object = {}> = Mixins extends readonly [
  infer Head extends EntityMixin,
  ...infer Tail extends ReadonlyArray<EntityMixin>,
]
  ? MixinFields<Tail, MergeObjects<Acc, UnwrapFieldOverrides<Head["fields"]>>>
  : [Mixins[number]] extends [never]
    ? Acc
    : MergeObjects<Acc, ObjectIntersection<UnwrapFieldOverrides<Mixins[number]["fields"]>>>;

type MixinFieldMap<Mixins extends ReadonlyArray<EntityMixin>, Acc extends object = {}> = Mixins extends readonly [
  infer Head extends EntityMixin,
  ...infer Tail extends ReadonlyArray<EntityMixin>,
]
  ? MixinFieldMap<Tail, MergeObjects<Acc, Head["fieldMap"]>>
  : [Mixins[number]] extends [never]
    ? Acc
    : MergeObjects<Acc, ObjectIntersection<Mixins[number]["fieldMap"]>>;

/**
 * Packed entity mixins ready for BaseEntity and Table.make.
 *
 * @example
 * ```ts
 * import type { Pack } from "@beep/shared-domain/entity/EntityMixin"
 *
 * type MixinPack = Pack
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Pack<
  Fields extends VariantSchema.Struct.Fields = VariantSchema.Struct.Fields,
  FieldMap extends AnyFieldDescriptorMap = FieldDescriptorMap<Fields>,
  Mixins extends ReadonlyArray<EntityMixin> = ReadonlyArray<EntityMixin>,
> = {
  readonly [PackTypeId]: typeof PackTypeId;
  readonly fieldKeys: ReadonlyArray<keyof Fields & string>;
  readonly fieldMap: FieldMap;
  readonly fields: Fields;
  readonly mixins: Mixins;
};

/**
 * Packed mixin type materialized from a literal mixin tuple.
 *
 * @example
 * ```ts
 * import type { PackFromMixins } from "@beep/shared-domain/entity/EntityMixin"
 *
 * type Empty = PackFromMixins<readonly []>
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type PackFromMixins<Mixins extends ReadonlyArray<EntityMixin>> = Pack<
  MixinFields<Mixins>,
  MixinFieldMap<Mixins>,
  Mixins
>;

/**
 * Empty packed mixin collection.
 *
 * @example
 * ```ts
 * import type { EmptyPack } from "@beep/shared-domain/entity/EntityMixin"
 *
 * type Empty = EmptyPack
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type EmptyPack = PackFromMixins<readonly []>;

/**
 * Error thrown when a field is contributed twice without an explicit override.
 *
 * @example
 * ```ts
 * import { EntityMixinFieldCollisionError } from "@beep/shared-domain/entity/EntityMixin"
 *
 * const error = new EntityMixinFieldCollisionError({ key: "name" })
 * console.log(error.key)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class EntityMixinFieldCollisionError extends TaggedErrorClass<EntityMixinFieldCollisionError>(
  $I`EntityMixinFieldCollisionError`
)(
  "EntityMixinFieldCollisionError",
  {
    key: S.String,
  },
  $I.annote("EntityMixinFieldCollisionError", {
    description: "Raised when entity fields collide without an explicit EntityMixin.Override.",
  })
) {}

/**
 * Error thrown when a mixin field lacks descriptor metadata.
 *
 * @example
 * ```ts
 * import { EntityMixinDescriptorMissingError } from "@beep/shared-domain/entity/EntityMixin"
 *
 * const error = new EntityMixinDescriptorMissingError({ key: "name" })
 * console.log(error.key)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class EntityMixinDescriptorMissingError extends TaggedErrorClass<EntityMixinDescriptorMissingError>(
  $I`EntityMixinDescriptorMissingError`
)(
  "EntityMixinDescriptorMissingError",
  {
    key: S.String,
  },
  $I.annote("EntityMixinDescriptorMissingError", {
    description: "Raised when an EntityMixin field lacks descriptor metadata.",
  })
) {}

/**
 * Error thrown when a mixin field descriptor fails schema validation.
 *
 * @example
 * ```ts
 * import { EntityMixinDescriptorInvalidError } from "@beep/shared-domain/entity/EntityMixin"
 *
 * const error = new EntityMixinDescriptorInvalidError({ key: "name", cause: "invalid descriptor" })
 * console.log(error.message)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class EntityMixinDescriptorInvalidError extends TaggedErrorClass<EntityMixinDescriptorInvalidError>(
  $I`EntityMixinDescriptorInvalidError`
)(
  "EntityMixinDescriptorInvalidError",
  {
    cause: S.Unknown,
    key: S.String,
  },
  $I.annote("EntityMixinDescriptorInvalidError", {
    description: "Raised when an EntityMixin field descriptor fails schema validation.",
  })
) {
  override get message() {
    return `EntityMixin descriptor metadata is invalid for field "${this.key}".`;
  }
}

/**
 * Wrap a field so it can intentionally override an earlier field.
 *
 * @example
 * ```ts
 * import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin"
 *
 * const field = EntityMixin.Override("replacement", "Fixture override")
 * console.log(field.reason)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Override: {
  <Field>(field: Field, reason: string): FieldOverride<Field>;
  (reason: string): <Field>(field: Field) => FieldOverride<Field>;
} = dual(
  2,
  <Field>(field: Field, reason: string): FieldOverride<Field> => ({
    [OverrideTypeId]: OverrideTypeId,
    field,
    reason,
  })
);

/**
 * Test whether an unknown value is an explicit field override.
 *
 * @example
 * ```ts
 * import { isOverride, Override } from "@beep/shared-domain/entity/EntityMixin"
 *
 * console.log(isOverride(Override("replacement", "fixture")))
 * ```
 *
 * @since 0.0.0
 * @category guards
 */
export const isOverride = (u: unknown): u is FieldOverride<unknown> => P.hasProperty(u, OverrideTypeId);

/**
 * Test whether an unknown value is an entity mixin.
 *
 * @example
 * ```ts
 * import { isMixin, make } from "@beep/shared-domain/entity/EntityMixin"
 * import { $SharedDomainId } from "@beep/identity/packages"
 * import * as S from "effect/Schema"
 *
 * const $I = $SharedDomainId.create("entity/example")
 * const Example = make($I`Example`)({
 *   note: S.String,
 * }, {
 *   description: "Example mixin.",
 *   fields: {
 *     note: {
 *       columnName: "note",
 *       description: "Example note.",
 *       nullable: false,
 *       storageKind: "text",
 *       valueStrategy: "provided",
 *     },
 *   },
 * })
 * console.log(isMixin(Example))
 * ```
 *
 * @since 0.0.0
 * @category guards
 */
export const isMixin = (u: unknown): u is EntityMixin => P.hasProperty(u, TypeId);

/**
 * Test whether an unknown value is a packed mixin collection.
 *
 * @example
 * ```ts
 * import { isPack, pack } from "@beep/shared-domain/entity/EntityMixin"
 *
 * console.log(isPack(pack()))
 * ```
 *
 * @since 0.0.0
 * @category guards
 */
export const isPack = (u: unknown): u is Pack => P.hasProperty(u, PackTypeId);

const unwrapField = <Field>(field: Field | FieldOverride<Field>): Field => (isOverride(field) ? field.field : field);

const failCollision = (key: string): never => {
  throw new EntityMixinFieldCollisionError({ key });
};

const decodeFieldDescriptorResult = S.decodeUnknownResult(FieldDescriptor);
const mapDescriptorIssue = (key: string) => (cause: SchemaIssue.Issue) =>
  new EntityMixinDescriptorInvalidError({ cause, key });

const decodeFieldDescriptor = <
  Fields extends FieldInputMap,
  Def extends Definition<Fields>,
  const Key extends keyof Fields & string,
>(
  definition: Def,
  key: Key,
  _field: Fields[Key]
): FieldDescriptorFromInput<Key, Def["fields"][Key]> => {
  const descriptor = definition.fields[key];
  if (descriptor === undefined) {
    throw new EntityMixinDescriptorMissingError({ key });
  }
  return pipe(
    decodeFieldDescriptorResult(Struct.assign(descriptor, { key })),
    Result.mapError(mapDescriptorIssue(key)),
    Result.getOrThrow
  ) as FieldDescriptorFromInput<Key, Def["fields"][Key]>;
};

const fieldMapFromRuntime = <Fields extends FieldInputMap, Def extends Definition<Fields>>(
  entries: Iterable<readonly [keyof Fields & string, unknown]>
): FieldDescriptorMapFromDefinition<Fields, Def> =>
  Struct.fromEntries(entries) as FieldDescriptorMapFromDefinition<Fields, Def>;

const makeFieldMap = <Fields extends FieldInputMap, Def extends Definition<Fields>>(
  fields: Fields,
  definition: Def
): FieldDescriptorMapFromDefinition<Fields, Def> =>
  fieldMapFromRuntime(
    pipe(
      Struct.entries(fields),
      A.map(([key, field]) => [key, decodeFieldDescriptor(definition, key, field)] as const)
    )
  );

const nameFromIdentifier = flow(Str.split("/"), A.lastNonEmpty);

const packFromRuntime = <const Mixins extends ReadonlyArray<EntityMixin>>(
  runtimePack: Pack<VariantSchema.Struct.Fields, Record<string, FieldDescriptor>, Mixins>
): PackFromMixins<Mixins> => runtimePack as PackFromMixins<Mixins>;

/**
 * Build a first-class entity mixin contract.
 *
 * @example
 * ```ts
 * import { $SharedDomainId } from "@beep/identity/packages"
 * import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin"
 * import * as S from "effect/Schema"
 *
 * const $I = $SharedDomainId.create("entity/example")
 * const Example = EntityMixin.make($I`Example`)(
 *   { note: S.String },
 *   {
 *     description: "Example mixin.",
 *     fields: {
 *       note: {
 *         columnName: "note",
 *         description: "Example note.",
 *         nullable: false,
 *         storageKind: "text",
 *         valueStrategy: "provided",
 *       },
 *     },
 *   }
 * )
 * console.log(Example.name)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const make =
  (identifier: string) =>
  <
    const Fields extends FieldInputMap,
    const FieldDefinitions extends FieldDescriptorInputMap<Fields>,
    const Def extends Definition<Fields, FieldDefinitions>,
  >(
    fields: Fields,
    definition: Def,
    _annotations?: unknown
  ): EntityMixin<Fields, Def> => ({
    [TypeId]: TypeId,
    definition,
    fieldKeys: Struct.keys(fields),
    fieldMap: makeFieldMap(fields, definition),
    fields,
    identifier,
    name: nameFromIdentifier(identifier),
  });

/**
 * Pack mixins in declaration order for BaseEntity and Table.make.
 *
 * @example
 * ```ts
 * import { pack } from "@beep/shared-domain/entity/EntityMixin"
 *
 * const empty = pack()
 * console.log(empty.fieldKeys.length)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const pack = <const Mixins extends ReadonlyArray<EntityMixin>>(...mixins: Mixins): PackFromMixins<Mixins> => {
  let fields = R.empty<string, VariantSchema.Struct.Fields[string]>();
  let fieldMap = R.empty<string, FieldDescriptor>();
  let fieldKeys: ReadonlyArray<string> = A.empty<string>();

  for (const mixin of mixins) {
    for (const key of mixin.fieldKeys) {
      const next = mixin.fields[key];
      if (R.has(fields, key) && !isOverride(next)) {
        failCollision(key);
      }
      fields = R.set(fields, key, unwrapField(next));
      fieldMap = R.set(fieldMap, key, mixin.fieldMap[key]);
      if (!A.contains(fieldKeys, key)) {
        fieldKeys = A.append(fieldKeys, key);
      }
    }
  }

  return packFromRuntime({
    [PackTypeId]: PackTypeId,
    fieldKeys,
    fieldMap,
    fields,
    mixins,
  });
};
