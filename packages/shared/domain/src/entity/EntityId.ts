/**
 * Shared-kernel entity identifier constructor.
 *
 * @module
 * @since 0.0.0
 */

import { $SharedDomainId, type IdentityComposer } from "@beep/identity";
import { PostgresSerialInt } from "@beep/schema/Int";
import * as Str from "@beep/utils/Str";
import { Struct } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity/EntityId");

/**
 * PostgreSQL serial integer used by every v1 persisted entity id.
 *
 * @example
 * ```ts
 * import { EntityIdValue } from "@beep/shared-domain/entity/EntityId"
 * import * as S from "effect/Schema"
 *
 * const id = S.decodeUnknownSync(EntityIdValue)(1)
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const EntityIdValue = PostgresSerialInt.pipe(
  S.brand("EntityIdValue"),
  $I.annoteSchema("EntityIdValue", {
    description: "PostgreSQL serial integer used by shared-kernel persisted entity ids.",
  })
);

/**
 * Runtime type for {@link EntityIdValue}.
 *
 * @since 0.0.0
 * @category models
 */
export type EntityIdValue = typeof EntityIdValue.Type;

/**
 * Constrained metadata overrides accepted by {@link factory}.
 *
 * @example
 * ```ts
 * import { Options } from "@beep/shared-domain/entity/EntityId"
 *
 * const options = new Options({ tableName: "shared_organization" })
 * console.log(options.tableName)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Options extends S.Class<Options>($I`Options`)(
  {
    brand: S.optionalKey(S.String),
    description: S.optionalKey(S.String),
    entityType: S.optionalKey(S.String),
    resource: S.optionalKey(S.String),
    tableName: S.optionalKey(S.String),
  },
  $I.annote("Options", {
    description: "Constrained metadata overrides accepted by EntityId.factory.",
  })
) {}

/**
 * Default SQL table name derived from a slice and entity segment.
 *
 * @example
 * ```ts
 * import type { TableName } from "@beep/shared-domain/entity/EntityId"
 *
 * const tableName: TableName<"shared", "organization"> = "shared_organization"
 * console.log(tableName)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type TableName<Slice extends string, Name extends string> = `${Slice}_${Name}`;

/**
 * Default permission resource derived from a slice and entity segment.
 *
 * @example
 * ```ts
 * import type { Resource } from "@beep/shared-domain/entity/EntityId"
 *
 * const resource: Resource<"shared", "organization"> = "shared.organization"
 * console.log(resource)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Resource<Slice extends string, Name extends string> = `${Slice}.${Name}`;

type Snake<S extends string> = ReturnType<typeof Str.snakeCase<S>>;
type SnakeToPascal<S extends string> = ReturnType<typeof Str.snakeToPascal<Snake<S>>>;

/**
 * Default entity type derived from a slice and entity segment.
 *
 * @example
 * ```ts
 * import type { EntityType } from "@beep/shared-domain/entity/EntityId"
 *
 * const entityType: EntityType<"shared", "organization"> = "SharedOrganization"
 * console.log(entityType)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type EntityType<Slice extends string, Name extends string> = `${SnakeToPascal<Slice>}${SnakeToPascal<Name>}`;

/**
 * Default schema brand derived from a slice and entity segment.
 *
 * @example
 * ```ts
 * import type { Brand } from "@beep/shared-domain/entity/EntityId"
 *
 * const brand: Brand<"shared", "organization"> = "SharedOrganizationId"
 * console.log(brand)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Brand<Slice extends string, Name extends string> = `${EntityType<Slice, Name>}Id`;

/**
 * Constructor input for {@link Options}.
 *
 * @since 0.0.0
 * @category models
 */
export type OptionsInput = typeof Options.Encoded;

type OverrideString<Overrides, Key extends keyof OptionsInput, Default extends string> = Overrides extends undefined
  ? Default
  : Key extends keyof Overrides
    ? Extract<Overrides[Key], string> extends never
      ? Default
      : Extract<Overrides[Key], string>
    : Default;

type ResolvedTableName<Slice extends string, Name extends string, Overrides> = OverrideString<
  Overrides,
  "tableName",
  TableName<Slice, Name>
>;
type ResolvedResource<Slice extends string, Name extends string, Overrides> = OverrideString<
  Overrides,
  "resource",
  Resource<Slice, Name>
>;
type ResolvedEntityType<Slice extends string, Name extends string, Overrides> = OverrideString<
  Overrides,
  "entityType",
  EntityType<Slice, Name>
>;
type ResolvedBrand<Slice extends string, Name extends string, Overrides> = OverrideString<
  Overrides,
  "brand",
  Brand<Slice, Name>
>;

/**
 * Materialized entity-id definition metadata.
 *
 * @since 0.0.0
 * @category models
 */
export class Definition extends S.Class<Definition>($I`Definition`)(
  {
    brand: S.String,
    description: S.String,
    entityType: S.String,
    name: S.String,
    overrides: Options,
    resource: S.String,
    slice: S.String,
    tableName: S.String,
  },
  $I.annote("Definition", {
    description: "Materialized entity-id metadata derived from a slice and entity name.",
  })
) {}

/**
 * Literal-preserving entity-id definition metadata.
 *
 * @example
 * ```ts
 * import type { DefinitionFor } from "@beep/shared-domain/entity/EntityId"
 *
 * type OrganizationDefinition = DefinitionFor<"shared", "organization">
 *
 * const tableName: OrganizationDefinition["tableName"] = "shared_organization"
 * console.log(tableName)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type DefinitionFor<
  Slice extends string,
  Name extends string,
  TTableName extends string = TableName<Slice, Name>,
  TResource extends string = Resource<Slice, Name>,
  TEntityType extends string = EntityType<Slice, Name>,
  TBrand extends string = Brand<Slice, Name>,
> = Omit<Definition, "brand" | "entityType" | "name" | "resource" | "slice" | "tableName"> & {
  readonly brand: TBrand;
  readonly entityType: TEntityType;
  readonly name: Name;
  readonly resource: TResource;
  readonly slice: Slice;
  readonly tableName: TTableName;
};

/**
 * Branded schema with deterministic entity metadata statics.
 *
 * @since 0.0.0
 * @category models
 */
export type EntityId<
  Slice extends string = string,
  Name extends string = string,
  TTableName extends string = TableName<Slice, Name>,
  TResource extends string = Resource<Slice, Name>,
  TEntityType extends string = EntityType<Slice, Name>,
  TBrand extends string = Brand<Slice, Name>,
> = S.Top & {
  readonly Type: EntityIdValue;
  readonly brand: TBrand;
  readonly definition: DefinitionFor<Slice, Name, TTableName, TResource, TEntityType, TBrand>;
  readonly entityType: TEntityType;
  readonly resource: TResource;
  readonly slice: Slice;
  readonly tableName: TTableName;
};

/**
 * Any entity id schema produced by {@link factory}.
 *
 * @since 0.0.0
 * @category models
 */
export type Any = EntityId<string, string, string, string, string, string>;

type Maker<Slice extends string> = <
  const Name extends string,
  const Overrides extends OptionsInput | undefined = undefined,
>(
  name: Name,
  overrides?: Overrides
) => EntityId<
  Slice,
  Name,
  ResolvedTableName<Slice, Name, Overrides>,
  ResolvedResource<Slice, Name, Overrides>,
  ResolvedEntityType<Slice, Name, Overrides>,
  ResolvedBrand<Slice, Name, Overrides>
>;

type Factory = {
  <const Slice extends string>(slice: Slice, identity: IdentityComposer<string>): Maker<Slice>;
  (identity: IdentityComposer<string>): <const Slice extends string>(slice: Slice) => Maker<Slice>;
};

const buildDefinition = <
  const Slice extends string,
  const Name extends string,
  const Overrides extends OptionsInput | undefined,
>(
  slice: Slice,
  name: Name,
  input?: Overrides
): DefinitionFor<
  Slice,
  Name,
  ResolvedTableName<Slice, Name, Overrides>,
  ResolvedResource<Slice, Name, Overrides>,
  ResolvedEntityType<Slice, Name, Overrides>,
  ResolvedBrand<Slice, Name, Overrides>
> => {
  const overrides = new Options(input ?? {});
  const defaultEntityType = Str.prefix(Str.snakeToPascal(Str.snakeCase(name)), Str.snakeToPascal(Str.snakeCase(slice)));
  const entityType = overrides.entityType ?? defaultEntityType;
  const brand = overrides.brand ?? Str.postfix(entityType, "Id");
  return new Definition({
    brand,
    description: overrides.description ?? `${entityType} entity identifier.`,
    entityType,
    name,
    overrides,
    resource: overrides.resource ?? (`${slice}.${name}` as const),
    slice,
    tableName: overrides.tableName ?? (`${slice}_${name}` as const),
  }) as DefinitionFor<
    Slice,
    Name,
    ResolvedTableName<Slice, Name, Overrides>,
    ResolvedResource<Slice, Name, Overrides>,
    ResolvedEntityType<Slice, Name, Overrides>,
    ResolvedBrand<Slice, Name, Overrides>
  >;
};

/**
 * Build a slice-scoped entity id maker.
 *
 * @example
 * ```ts
 * import { $SharedDomainId } from "@beep/identity/packages"
 * import * as EntityId from "@beep/shared-domain/entity/EntityId"
 *
 * const $I = $SharedDomainId.create("identity/Shared")
 * const make = EntityId.factory("shared", $I)
 * const OrganizationId = make("organization")
 *
 * console.log(OrganizationId.tableName)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const factory: Factory = dual(
  2,
  <const Slice extends string>(slice: Slice, identity: IdentityComposer<string>): Maker<Slice> =>
    <const Name extends string, const Overrides extends OptionsInput | undefined = undefined>(
      name: Name,
      overrides?: Overrides
    ): EntityId<
      Slice,
      Name,
      ResolvedTableName<Slice, Name, Overrides>,
      ResolvedResource<Slice, Name, Overrides>,
      ResolvedEntityType<Slice, Name, Overrides>,
      ResolvedBrand<Slice, Name, Overrides>
    > => {
      const definition = buildDefinition(slice, name, overrides);
      const schema = EntityIdValue.pipe(
        S.brand(definition.brand),
        identity.annoteSchema(definition.brand, {
          description: definition.description,
        })
      );

      return Struct.assign(schema, {
        brand: definition.brand,
        definition,
        entityType: definition.entityType,
        resource: definition.resource,
        slice,
        tableName: definition.tableName,
      }) as EntityId<
        Slice,
        Name,
        ResolvedTableName<Slice, Name, Overrides>,
        ResolvedResource<Slice, Name, Overrides>,
        ResolvedEntityType<Slice, Name, Overrides>,
        ResolvedBrand<Slice, Name, Overrides>
      >;
    }
) as Factory;
