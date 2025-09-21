import { IamEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
export const apiKey = OrgTable.make(IamEntityIds.ApiKeyId)(
  {
    name: pg.text("name"),
    start: pg.text("start"),
    prefix: pg.text("prefix"),
    key: pg.text("key").notNull(),
    userId: pg
      .text("user_id")
      .notNull()
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),
    refillInterval: pg.integer("refill_interval"),
    refillAmount: pg.integer("refill_amount"),
    lastRefillAt: pg.timestamp("last_refill_at"),
    enabled: pg.boolean("enabled").notNull().default(true),
    rateLimitEnabled: pg.boolean("rate_limit_enabled").notNull().default(true),
    rateLimitTimeWindow: pg.integer("rate_limit_time_window").notNull().default(86400000),
    rateLimitMax: pg.integer("rate_limit_max").notNull().default(10),
    requestCount: pg.integer("request_count"),
    remaining: pg.integer("remaining"),
    lastRequest: pg.timestamp("last_request"),
    expiresAt: pg.timestamp("expires_at"),
    permissions: pg.text("permissions"),
    metadata: pg.text("metadata"),
  },
  (t) => [
    // Count constraints
    pg.check("apikey_request_count_non_negative_check", d.sql`${t.requestCount} IS NULL OR ${t.requestCount} >= 0`),
    pg.check("apikey_refill_amount_non_negative_check", d.sql`${t.refillAmount} IS NULL OR ${t.refillAmount} >= 0`),
    pg.check(
      "apikey_rate_limit_time_window_positive_check",
      d.sql`${t.rateLimitTimeWindow} IS NULL OR ${t.rateLimitTimeWindow} > 0`
    ),
    pg.check("apikey_rate_limit_max_positive_check", d.sql`${t.rateLimitMax} IS NULL OR ${t.rateLimitMax} > 0`),
    pg.check("apikey_remaining_non_negative_check", d.sql`${t.remaining} IS NULL OR ${t.remaining} >= 0`),
  ]
);
