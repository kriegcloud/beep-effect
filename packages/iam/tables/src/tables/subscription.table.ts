import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
export const subscription = OrgTable.make(IamEntityIds.SubscriptionId)({
  plan: pg.text("plan").notNull(),
  referenceId: pg.text("reference_id").notNull(),
  stripeCustomerId: pg.text("stripe_customer_id"),
  stripeSubscriptionId: pg.text("stripe_subscription_id"),
  status: pg.text("status").notNull().default("incomplete"),
  periodStart: pg.timestamp("period_start"),
  periodEnd: pg.timestamp("period_end"),
  cancelAtPeriodEnd: pg.boolean("cancel_at_period_end").notNull().default(false),
  seats: pg.integer("seats"),
});
