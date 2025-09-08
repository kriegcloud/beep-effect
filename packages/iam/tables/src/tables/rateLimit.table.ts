import { IamEntityIds } from "@beep/shared-domain";
import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const rateLimit = pg.pgTable("rate_limit", {
  id: Common.idColumn("rate_limit", IamEntityIds.RateLimitId),
  key: pg.text("key"),
  count: pg.integer("count"),
  lastRequest: pg.bigint("last_request", { mode: "number" }),
  ...Common.globalColumns,
});
