// import * as d from "drizzle-orm";
import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const itemTable = pg.pgTable(
  "item",
  {
    id: pg.text("id").primaryKey(),
    name: pg.text("name").notNull(),
    lotControlled: pg.boolean("lot_controlled").notNull().default(false),
    description: pg.text("description"),
    active: pg.boolean("active").notNull().default(true),
    // image
    ...Common.defaultColumns,
  },
  (t) => [
    pg.uniqueIndex("item_org_name_unique_idx").on(t.organizationId, t.name),
    pg.uniqueIndex("item_org_id_unique_idx").on(t.organizationId, t.id),
  ]
);
