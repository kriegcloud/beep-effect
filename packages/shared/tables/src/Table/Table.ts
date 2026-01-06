import type {EntityId} from "@beep/schema/identity";
import type {DefaultColumns, DefaultColumns2} from "@beep/shared-tables/Columns";
import type {BuildColumns, BuildExtraConfigColumns} from "drizzle-orm";
import type {PgTableExtraConfigValue} from "drizzle-orm/pg-core";
import * as pg from "drizzle-orm/pg-core";
import {globalColumns} from "../common";
import type * as V2 from "@beep/schema/identity/entity-id/e-id";

export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>
) => {
  const defaultColumns: DefaultColumns<TableName, Brand> = {
    id: entityId.publicId(),
    _rowId: entityId.privateId(),
    ...globalColumns,
  };

  const maker =
    (defaultColumns: DefaultColumns<TableName, Brand>) =>
      <TColumnsMap extends Omit<Record<string, pg.PgColumnBuilderBase>, keyof DefaultColumns<TableName, Brand>>>(
        columns: TColumnsMap,
        extraConfig?:
          | ((
          self: BuildExtraConfigColumns<TableName, TColumnsMap & DefaultColumns<TableName, Brand>, "pg">
        ) => PgTableExtraConfigValue[])
          | undefined
      ) => {
        const cols = {
          ...defaultColumns,
          ...columns,
        };
        return pg.pgTable<TableName, TColumnsMap & DefaultColumns<TableName, Brand>>(
          entityId.tableName,
          cols,
          extraConfig
        ) as pg.PgTableWithColumns<{
          name: TableName;
          schema: undefined;
          columns: BuildColumns<TableName, TColumnsMap & DefaultColumns<TableName, Brand>, "pg">;
          dialect: "pg";
        }>;
      };

  return maker(defaultColumns);
};


type DefaultColumnKeys = keyof DefaultColumns2<string, string>

/**
 * Constraint type that produces a compile error when conflicting keys are provided.
 * Works by requiring conflicting keys to be `never`, which is unsatisfiable.
 *
 * @example
 * // This will error:
 * Table.make2(SomeId)({ id: pg.text("id") })
 * // Error: Type 'PgTextBuilderInitial<...>' is not assignable to type 'never'
 */
type NoDefaultKeys<T> = T & { readonly [K in DefaultColumnKeys]?: never };

/**
 * Custom merge type that:
 * 1. Flattens the intersection into a single mapped type (cleaner display)
 * 2. Gives defaults precedence (left side wins)
 * 3. Preserves Record<string, PgColumnBuilderBase> constraint for Drizzle
 *
 * Note: We can't use Types.MergeLeft here because its `infer` pattern
 * causes TypeScript to lose the structural constraint Drizzle requires.
 */
type MergedColumns<
  Defaults extends Record<string, pg.PgColumnBuilderBase>,
  Custom extends Record<string, pg.PgColumnBuilderBase>
> = {
  [K in keyof Defaults | keyof Custom]: K extends keyof Defaults
    ? Defaults[K]
    : K extends keyof Custom
      ? Custom[K]
      : never;
};
type ColumnsMap = Omit<Record<string, pg.PgColumnBuilderBase>, DefaultColumnKeys>

type ExtraConfigColumns<
  TableName extends string,
  Brand extends string,
  TColumnsMap extends ColumnsMap
> = BuildExtraConfigColumns<TableName, MergedColumns<DefaultColumns2<TableName, Brand>, TColumnsMap>, "pg">

type ExtraConfig<
  TableName extends string,
  Brand extends string,
  TColumnsMap extends ColumnsMap
> = undefined | ((
  self: ExtraConfigColumns<TableName, Brand, TColumnsMap>
) => PgTableExtraConfigValue[])

/**
 * Forces TypeScript to expand a type in hover tooltips.
 */
type Prettify<T> = { [K in keyof T]: T[K] } & {};

/**
 * All columns (defaults + custom), flattened for clean display.
 * This is the type that will be displayed in hover tooltips.
 */
type AllColumns<
  TableName extends string,
  Brand extends string,
  TColumnsMap extends ColumnsMap
> = Prettify<MergedColumns<DefaultColumns2<TableName, Brand>, TColumnsMap>>;

/**
 * Final table type parameterized by the MERGED columns directly.
 * By taking AllColumns as the parameter (not TColumnsMap), TypeScript
 * will display the full merged column set in hover tooltips.
 */
type PgTableWithColumns<
  TableName extends string,
  TAllColumns extends Record<string, pg.PgColumnBuilderBase>
> = pg.PgTableWithColumns<{
  name: TableName;
  schema: undefined;
  columns: BuildColumns<TableName, TAllColumns, "pg">;
  dialect: "pg";
}>


export const make2 = <const TableName extends string, const Brand extends string>(
  entityId: V2.EntityId<TableName, Brand>
): <TColumnsMap extends ColumnsMap>(
  columns: NoDefaultKeys<TColumnsMap>,
  extraConfig?: ExtraConfig<TableName, Brand, TColumnsMap>
) => PgTableWithColumns<TableName, AllColumns<TableName, Brand, TColumnsMap>> => {
  const defaultColumns: DefaultColumns2<TableName, Brand> = {
    id: entityId.publicId(),
    _rowId: entityId.privateId(),
    ...globalColumns,
  };

  const maker =
    (defaultColumns: DefaultColumns2<TableName, Brand>): <TColumnsMap extends ColumnsMap>(
      columns: NoDefaultKeys<TColumnsMap>,
      extraConfig?: ExtraConfig<TableName, Brand, TColumnsMap>
    ) => PgTableWithColumns<TableName, AllColumns<TableName, Brand, TColumnsMap>> =>
      <TColumnsMap extends ColumnsMap>(
        columns: NoDefaultKeys<TColumnsMap>,
        extraConfig?: ExtraConfig<TableName, Brand, TColumnsMap>
      ): PgTableWithColumns<TableName, AllColumns<TableName, Brand, TColumnsMap>> => {
        const cols = {
          ...defaultColumns,
          ...columns,
        };
        return pg.pgTable<TableName, AllColumns<TableName, Brand, TColumnsMap>>(
          entityId.tableName,
          cols,
          extraConfig
        );
      };

  return maker(defaultColumns);
};
