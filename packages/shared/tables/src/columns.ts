import type { EntityId } from "@beep/schema/identity";
import type { HasDefault, HasRuntimeDefault, NotNull } from "drizzle-orm";
import type * as pg from "drizzle-orm/pg-core";
import type * as DateTime from "effect/DateTime";

export { bytea, byteaBase64 } from "./columns/bytea";
export { type DateTimeInput, datetime, sqlNow } from "./columns/custom-datetime";

/** Custom datetime column builder type for audit columns */
type DateTimeColumnBuilder<TName extends string> = pg.PgCustomColumnBuilder<{
  name: TName;
  dataType: "custom";
  columnType: "PgCustomColumn";
  data: string | number | Date | DateTime.Utc;
  driverParam: string;
  enumValues: undefined;
}>;

export type DefaultColumns<TableName extends string, Brand extends string> = {
  id: EntityId.EntityId.PublicIdColumn<TableName>;
  _rowId: EntityId.EntityId.PrivateIdColumn<Brand>;
  createdAt: HasRuntimeDefault<HasDefault<NotNull<DateTimeColumnBuilder<"created_at">>>>;
  updatedAt: HasDefault<NotNull<DateTimeColumnBuilder<"updated_at">>>;
  deletedAt: DateTimeColumnBuilder<"deleted_at">;
  createdBy: pg.PgTextBuilderInitial<"created_by", [string, ...string[]]>;
  updatedBy: pg.PgTextBuilderInitial<"updated_by", [string, ...string[]]>;
  deletedBy: pg.PgTextBuilderInitial<"deleted_by", [string, ...string[]]>;
  version: HasDefault<HasDefault<NotNull<pg.PgIntegerBuilderInitial<"version">>>>;
  source: pg.PgTextBuilderInitial<"source", [string, ...string[]]>;
};
