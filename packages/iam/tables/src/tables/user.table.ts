import { IamEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/shared-tables";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import { boolean, text } from "drizzle-orm/pg-core";
export const user = Table.make(IamEntityIds.UserId)(
  {
    name: pg.text("name").notNull(),
    email: pg.text("email").notNull().unique(),
    emailVerified: pg
      .boolean("email_verified")
      .$defaultFn(() => false)
      .notNull(),
    image: pg.text("image"),
    phoneNumber: text("phone_number").unique(),
    phoneNumberVerified: boolean("phone_number_verified"),
    username: text("username").unique(),
    displayUsername: text("display_username"),
    twoFactorEnabled: pg.boolean("two_factor_enabled"),
    isAnonymous: pg.boolean("is_anonymous"),
    role: pg.text("role"),
    banned: pg.boolean("banned"),
    banReason: pg.text("ban_reason"),
    banExpires: pg.timestamp("ban_expires"),
    stripeCustomerId: pg.text("stripe_customer_id"),
  },
  (t) => [
    // Index for email lookups (authentication)
    pg
      .index("user_email_idx")
      .on(t.email),

    // Partial index for active users (high selectivity)
    pg
      .index("user_active_idx")
      .on(t.id, t.emailVerified)
      .where(d.sql`${t.banned} IS NOT TRUE AND ${t.emailVerified} = true`),

    // Index for role-based queries (if roles are used for authorization)
    pg
      .index("user_role_idx")
      .on(t.role)
      .where(d.sql`${t.role} IS NOT NULL`),

    // Index for banned users cleanup and queries
    pg
      .index("user_banned_expires_idx")
      .on(t.banExpires)
      .where(d.sql`${t.banned} = true AND ${t.banExpires} IS NOT NULL`),

    // Index for two-factor enabled users
    pg
      .index("user_2fa_enabled_idx")
      .on(t.twoFactorEnabled)
      .where(d.sql`${t.twoFactorEnabled} = true`),
  ]
);
