/**
 * @since 0.0.0
 */

import type { IdentityComposer, SegmentValue } from "@beep/identity";
import { $SharedDomainId } from "@beep/identity/packages";
import { SchemaUtils } from "@beep/schema";
import type { TString } from "@beep/types";
import { flow } from "effect";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("EntityId");

/**
 * Maximum value for a positive JavaScript safe integer-backed entity id.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const ENTITY_ID_SAFE_MAX = Number.MAX_SAFE_INTEGER;

/**
 * Range filter constraining a number to the supported entity-id range.
 *
 * @since 0.0.0
 * @category Validation
 */
export const isEntityIdValueRange = S.isBetween({ minimum: 1, maximum: ENTITY_ID_SAFE_MAX });

/**
 * Branded schema for a storage-neutral positive integer entity id.
 *
 * Validates:
 * - Safe integer (no fractional values)
 * - Minimum value of 1 (auto-increment starts at 1)
 * - Maximum value of `Number.MAX_SAFE_INTEGER`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const EntityIdValue = S.Int.check(isEntityIdValueRange).pipe(
  S.brand("EntityIdValue"),
  S.annotate(
    $I.annote("EntityIdValue", {
      description: "A storage-neutral positive safe integer entity id value.",
    })
  )
);

/**
 * Type for {@link EntityIdValue}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EntityIdValue = typeof EntityIdValue.Type;

/**
 * Schema class describing an entity-id schema definition.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EntityIdDefinition extends S.Class<EntityIdDefinition>($I`EntityIdDefinition`)(
  {
    _tag: S.NonEmptyString,
    brand: S.NonEmptyString,
    tableName: S.NonEmptyString,
    context: S.String,
    description: S.String,
  },
  $I.annote("EntityIdDefinition", {
    description: "A branded schema definition for a storage-neutral integer entity id.",
  })
) {
  static readonly assert: (i: unknown) => asserts i is S.Schema.Type<EntityId.Any> = (
    i: unknown
  ): asserts i is S.Schema.Type<EntityId.Any> => S.asserts(EntityIdDefinition)(i);
}

/**
 * Entity-id schema namespace and associated type helpers.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace EntityId {
  /**
   * Runtime shape of a branded entity id.
   *
   * @since 0.0.0
   */
  export interface Instance<
    TTag extends TString.NonEmpty,
    TTableName extends TString.NonEmpty,
    TSlice extends TString.NonEmpty,
  > extends S.brand<S.brand<S.Int, "EntityIdValue">, TTag> {
    _tag: SegmentValue<TTag>;
    slice: TSlice;
    tableName: TTableName;
  }

  /**
   * Construction options for an entity-id schema.
   *
   * @since 0.0.0
   */
  export interface Options<TTableName extends string> {
    tableName: TTableName;
  }

  /**
   * Broad entity-id instance type.
   *
   * @since 0.0.0
   */
  export type Any = S.Schema.Type<Instance<TString.NonEmpty, TString.NonEmpty, TString.NonEmpty>>;

  /**
   * Encoded representation of an entity id.
   *
   * @since 0.0.0
   */
  export type Encoded<
    TTag extends TString.NonEmpty,
    TTableName extends TString.NonEmpty,
    TSlice extends TString.NonEmpty,
  > = Instance<TTag, TTableName, TSlice>["Encoded"];

  /**
   * Decoded representation of an entity id.
   *
   * @since 0.0.0
   */
  export type Type<
    TTag extends TString.NonEmpty,
    TTableName extends TString.NonEmpty,
    TSlice extends TString.NonEmpty,
  > = Instance<TTag, TTableName, TSlice>["Type"];
}

/**
 * Builds a branded entity-id schema for a slice-specific identity composer.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const make =
  <
    const TSlice extends TString.NonEmpty,
    const TTag extends TString.NonEmpty,
    const TTableName extends TString.NonEmpty,
  >(
    slice: TSlice,
    identity: IdentityComposer<`@beep/shared-domain/entity-ids/${TSlice}`>
  ) =>
  (_tag: SegmentValue<TTag>, opts: EntityId.Options<TTableName>): EntityId.Instance<TTag, TTableName, TSlice> => {
    const instance = EntityIdValue.pipe(
      S.brand(_tag),
      S.annotate(
        identity.annote(_tag, {
          description: `The entity ID for ${opts.tableName} in the ${slice}`,
        })
      ),
      SchemaUtils.withStatics(() => ({
        _tag,
        tableName: opts.tableName,
        slice,
      }))
    );
    EntityIdDefinition.assert(instance);
    return instance;
  };

/**
 * Type alias for a decoded entity-id value.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EntityId<
  TTag extends TString.NonEmpty,
  TTableName extends TString.NonEmpty,
  TSlice extends TString.NonEmpty,
> = EntityId.Type<TTag, TTableName, TSlice>;

/**
 * Curried entity-id factory creator.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const factory = flow(
  <const TSlice extends TString.NonEmpty>(
    slice: TSlice,
    identity: IdentityComposer<`@beep/shared-domain/entity-ids/${TSlice}`>
  ) => make(slice, identity)
);
