import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { warehouseTable } from "./warehouse.table";

export const locationTable = pg.pgTable(
  "location",
  {
    id: pg.text("id").primaryKey(),
    name: pg.text("name").notNull(),
    barcode: pg.text("barcode").notNull(),
    warehouseId: pg
      .text("warehouse_id")
      .notNull()
      .references(() => warehouseTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    ...Common.defaultColumns,
  },
  (t) => [
    pg
      .uniqueIndex("location_name_wh_org_id_idx")
      .on(t.warehouseId, t.name, t.organizationId),
    pg
      .uniqueIndex("location_barcode_wh_org_id_idx")
      .on(t.barcode, t.organizationId, t.warehouseId),
  ],
);
