import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import { utcNow } from "./common"

export const organization = pg.pgTable(
  "organization",
  {
    id: pg.text("id").primaryKey(),
    name: pg.text("name").notNull(),
    slug: pg.text("slug").unique(),
    logo: pg.text("logo"),
    metadata: pg.text("metadata"),

    // Multi-tenant enhancement fields
    type: pg.text("type").notNull().default("individual"), // 'individual', 'team', 'enterprise'
    ownerUserId: pg.text("owner_user_id"), // Reference to user who owns this org (relation defined in relations.ts)
    isPersonal: pg.boolean("is_personal").notNull().default(false), // True for auto-created personal orgs
    maxMembers: pg.integer("max_members"), // Maximum members allowed
    features: pg.text("features"), // JSON string for feature flags
    settings: pg.text("settings"), // JSON string for org settings
    subscriptionTier: pg.text("subscription_tier").default("free"), // 'free', 'plus', 'pro', etc.
    subscriptionStatus: pg.text("subscription_status").default("active"), // 'active', 'canceled', etc.

    createdAt: pg
      .timestamp("createdAt", { withTimezone: true })
      .notNull()
      .$defaultFn(utcNow),
    updatedAt: pg
      .timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .$onUpdateFn(utcNow),
    deletedAt: pg.timestamp("deletedAt", { withTimezone: true }),
    createdBy: pg.text("createdBy"),
    updatedBy: pg.text("updatedBy"),
    deletedBy: pg.text("deletedBy"),
    version: pg
      .integer("version")
      .notNull()
      .default(1)
      .$onUpdateFn(() => d.sql`version + 1`),
    source: pg.text("source"), // 'api', 'import', 'migration', etc.
    // ...withMetadataColumn<any>()
  },
  (t) => [
    // Index for name-based searches (case-insensitive)
    pg
      .index("organization_name_idx")
      .on(t.name),

    // Index for slug lookups (already unique, but explicit index for performance)
    pg
      .index("organization_slug_idx")
      .on(t.slug),

    // Multi-tenant indexes
    pg
      .index("organization_type_idx")
      .on(t.type),
    pg.index("organization_owner_idx").on(t.ownerUserId),
    pg
      .index("organization_personal_idx")
      .on(t.isPersonal)
      .where(d.sql`${t.isPersonal} = true`),
    pg
      .index("organization_subscription_idx")
      .on(t.subscriptionTier, t.subscriptionStatus),
  ],
);