import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { itemTable } from "./item.table";
import { locationTable } from "./location.table";
import { warehouseTable } from "./warehouse.table";

export const inventoryTable = pg.pgTable(
  "inventory",
  {
    id: pg.text("id").primaryKey(),
    quantity: pg.integer("quantity").notNull(),
    locationId: pg
      .text("location_id")
      .notNull()
      .references(() => locationTable.id, { onDelete: "cascade" }),
    warehouseId: pg
      .text("warehouse_id")
      .notNull()
      .references(() => warehouseTable.id, { onDelete: "cascade" }),
    itemId: pg
      .text("item_id")
      .notNull()
      .references(() => itemTable.id),
    ...Common.defaultColumns,
  },
  (t) => [
    pg
      .uniqueIndex("inventory_loc_item_wh_org_idx")
      .on(t.locationId, t.itemId, t.warehouseId, t.organizationId),
  ],
);
