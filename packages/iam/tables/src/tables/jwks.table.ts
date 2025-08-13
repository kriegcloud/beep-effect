import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const jwks = pg.pgTable("jwks", {
  id: pg.text("id").primaryKey(),
  publicKey: pg.text("public_key").notNull(),
  privateKey: pg.text("private_key").notNull(),
  ...Common.globalColumns,
});