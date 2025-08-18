import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const warehouseTable = pg.pgTable(
  "warehouse",
  {
    id: pg.text("id").primaryKey(),
    name: pg.text("name").notNull(),
    barcode: pg.text("barcode"),
    ...Common.defaultColumns,
  },
  (t) => [
    pg
      .uniqueIndex("warehouse_name_organization_id_idx")
      .on(t.name, t.organizationId),
    pg
      .uniqueIndex("warehouse_barcode_organization_id_idx")
      .on(t.barcode, t.organizationId),
    pg
      .uniqueIndex("warehouse_id_organization_id_idx")
      .on(t.id, t.organizationId),
  ],
);
