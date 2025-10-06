import { IamEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const rateLimit = Table.make(IamEntityIds.RateLimitId)({
  key: pg.text("key"),
  count: pg.integer("count"),
  lastRequest: pg.bigint("last_request", { mode: "number" }),
});
