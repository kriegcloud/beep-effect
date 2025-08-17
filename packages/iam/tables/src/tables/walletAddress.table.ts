import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { user } from "./user.table";

export const walletAddress = pg.pgTable(
  "verification",
  {
    id: pg.text("id").primaryKey(),
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    address: pg.text("address").notNull(),
    chainId: pg.integer("chain_id").notNull(),
    isPrimary: pg.boolean("is_primary"),
    ...Common.globalColumns,
  },
  (t) => [],
);
