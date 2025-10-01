import { SharedEntityIds } from "@beep/shared-domain";
import * as SharedEntities from "@beep/shared-domain/entities";
import { Table } from "@beep/shared-tables/Table";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
export const userRolePgEnum = SharedEntities.User.makeUserRolePgEnum("user_role_enum");
export const userGenderPgEnum = SharedEntities.User.makeUserGenderPgEnum("user_gender_enum");
export const user = Table.make(SharedEntityIds.UserId)(
  {
    name: pg.text("name").notNull(),
    email: pg.text("email").notNull().unique(),
    emailVerified: pg.boolean("email_verified").default(false).notNull(),
    image: pg.text("image"),
    role: userRolePgEnum("role").notNull().default(SharedEntities.User.UserRole.Enum.user),
    gender: userGenderPgEnum("gender").notNull().default(SharedEntities.User.UserGender.Enum.male),
    banned: pg.boolean("banned").notNull().default(false),
    banReason: pg.text("ban_reason"),
    banExpires: pg.timestamp("ban_expires"),
    isAnonymous: pg.boolean("is_anonymous").notNull().default(false),
    phoneNumber: pg.text("phone_number").unique(),
    phoneNumberVerified: pg.boolean("phone_number_verified").notNull().default(false),
    twoFactorEnabled: pg.boolean("two_factor_enabled").notNull().default(false),
    username: pg.text("username").unique(),
    displayUsername: pg.text("display_username"),
    stripeCustomerId: pg.text("stripe_customer_id"),
    lastLoginMethod: pg.text("last_login_method"),
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
