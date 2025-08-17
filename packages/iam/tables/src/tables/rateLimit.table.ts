import * as pg from "drizzle-orm/pg-core";

export const rateLimit = pg.pgTable("rate_limit", {
  id: pg.text("id").primaryKey(),
  key: pg.text("key"),
  count: pg.integer("count"),
  lastRequest: pg.bigint("last_request", { mode: "number" }),
});
