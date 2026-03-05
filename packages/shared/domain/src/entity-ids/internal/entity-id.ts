/**
 * @since 0.0.0
 */

import type { IdentityComposer, SegmentValue } from "@beep/identity";
import { $SharedDomainId } from "@beep/identity/packages";
import type { TString } from "@beep/types";
import { flow } from "effect";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("EntityId");

/**
 * Maximum value for a PostgreSQL 4-byte serial column.
 *
 * @since 0.0.0
 */
export const PG_SERIAL_MAX = 2_147_483_647;

/**
 * Range filter constraining a number to the PostgreSQL serial range (1 to 2,147,483,647).
 *
 * @since 0.0.0
 */
export const isSerialRange = S.isBetween({ minimum: 1, maximum: PG_SERIAL_MAX });

/**
 * Branded schema for a PostgreSQL serial (auto-incrementing 4-byte signed integer).
 *
 * Validates:
 * - Safe integer (no fractional values)
 * - Minimum value of 1 (auto-increment starts at 1)
 * - Maximum value of 2,147,483,647 (4-byte signed integer upper bound)
 *
 * @since 0.0.0
 */
export const PgSerial = S.Int.check(isSerialRange).pipe(
  S.brand("PgSerial"),
  S.annotate(
    $I.annote("PgSerial", {
      description: "A PostgreSQL serial (auto-incrementing 4-byte integer, 1 to 2,147,483,647)",
    })
  )
);

/**
 * Type for {@link PgSerial}.
 *
 * @since 0.0.0
 */
export type PgSerial = typeof PgSerial.Type;

export class EntityIdDefinition extends S.Class<EntityIdDefinition>($I`EntityIdDefinition`)(
  {
    _tag: S.NonEmptyString,
    brand: S.NonEmptyString,
    tableName: S.NonEmptyString,
    context: S.String,
    description: S.String,
  },
  $I.annote("EntityIdDefinition", {
    description: "A branded schema for a PostgreSQL serial (auto-incrementing 4-byte integer, 1 to 2,147,483,647)",
  })
) {
  static readonly assert: (i: unknown) => asserts i is S.Schema.Type<EntityId.Any> = (
    i: unknown
  ): asserts i is S.Schema.Type<EntityId.Any> => S.asserts(EntityIdDefinition)(i);
}
export declare namespace EntityId {
  export interface Instance<
    TTag extends TString.NonEmpty,
    TTableName extends TString.NonEmpty,
    TSlice extends TString.NonEmpty,
  > extends S.brand<S.brand<S.Int, "PgSerial">, TTag> {
    _tag: SegmentValue<TTag>;
    dataType: "int";
    slice: TSlice;
    tableName: TTableName;
  }
  export interface Options<TTableName extends string> {
    tableName: TTableName;
  }

  export type Any = S.Schema.Type<Instance<TString.NonEmpty, TString.NonEmpty, TString.NonEmpty>>;

  export type Encoded<
    TTag extends TString.NonEmpty,
    TTableName extends TString.NonEmpty,
    TSlice extends TString.NonEmpty,
  > = Instance<TTag, TTableName, TSlice>["Encoded"];

  export type Type<
    TTag extends TString.NonEmpty,
    TTableName extends TString.NonEmpty,
    TSlice extends TString.NonEmpty,
  > = Instance<TTag, TTableName, TSlice>["Type"];
}

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
    const base = PgSerial.pipe(S.brand(_tag));

    const instance = Object.assign(base, {
      _tag,
      tableName: opts.tableName,
      slice: slice,
      dataType: "int" as const,
    }).pipe(
      S.annotate(
        identity.annote(_tag, {
          description: `The entity ID for ${opts.tableName} in the ${slice}`,
        })
      )
    );
    EntityIdDefinition.assert(instance);
    return instance;
  };

export type EntityId<
  TTag extends TString.NonEmpty,
  TTableName extends TString.NonEmpty,
  TSlice extends TString.NonEmpty,
> = EntityId.Type<TTag, TTableName, TSlice>;

export const factory = flow(
  <const TSlice extends TString.NonEmpty>(
    slice: TSlice,
    identity: IdentityComposer<`@beep/shared-domain/entity-ids/${TSlice}`>
  ) => make(slice, identity)
);
