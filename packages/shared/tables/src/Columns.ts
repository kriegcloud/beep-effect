import type { EntityId } from "@beep/schema/EntityId";
import type { HasDefault, HasRuntimeDefault, NotNull } from "drizzle-orm";
import type * as pg from "drizzle-orm/pg-core";
import type { PgTimestampBuilderInitial } from "drizzle-orm/pg-core";

export type DefaultColumns<TableName extends string, Brand extends string> = {
  id: EntityId.PublicId<TableName>;
  _rowId: EntityId.PrivateId<Brand>;
  createdAt: HasRuntimeDefault<HasDefault<NotNull<PgTimestampBuilderInitial<"created_at">>>>;
  updatedAt: HasDefault<NotNull<pg.PgTimestampBuilderInitial<"updated_at">>>;
  deletedAt: pg.PgTimestampBuilderInitial<"deleted_at">;
  createdBy: pg.PgTextBuilderInitial<"created_by", [string, ...string[]]>;
  updatedBy: pg.PgTextBuilderInitial<"updated_by", [string, ...string[]]>;
  deletedBy: pg.PgTextBuilderInitial<"deleted_by", [string, ...string[]]>;
  version: HasDefault<HasDefault<NotNull<pg.PgIntegerBuilderInitial<"version">>>>;
  source: pg.PgTextBuilderInitial<"source", [string, ...string[]]>;
};
