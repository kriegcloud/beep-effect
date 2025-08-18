import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { itemTable } from "./item.table";

export const uomTable = pg.pgTable(
  "uom",
  {
    id: pg.text("id").primaryKey(),
    name: pg.text("name").notNull(),
    description: pg.text("description"),
    active: pg.boolean("active").notNull().default(true),
    sku: pg.text("sku").notNull(),
    itemId: pg
      .text("item")
      .notNull()
      .references(() => itemTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    ...Common.defaultColumns,
  },
  (t) => [
    pg
      .uniqueIndex("uom_item_sku_org_unique_idx")
      .on(t.itemId, t.sku, t.organizationId),
  ],
);
