import { IamEntityIds } from "@beep/shared-domain";
import { datetime, OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
export const subscription = OrgTable.make(IamEntityIds.SubscriptionId)(
  {
    plan: pg.text("plan").notNull(),
    referenceId: pg.text("reference_id").notNull(),
    stripeCustomerId: pg.text("stripe_customer_id"),
    stripeSubscriptionId: pg.text("stripe_subscription_id"),
    status: pg.text("status").notNull().default("incomplete"),
    periodStart: datetime("period_start"),
    periodEnd: datetime("period_end"),
    cancelAtPeriodEnd: pg.boolean("cancel_at_period_end").notNull().default(false),
    seats: pg.integer("seats"),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg
      .index("subscription_organization_id_idx")
      .on(t.organizationId),
  ]
);
