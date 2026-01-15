/**
 * Placeholder table definition for Calendar slice
 *
 * Defines the database table schema for the Placeholder entity.
 * Replace or rename with your actual domain table definitions.
 *
 * @module calendar-tables/tables/placeholder
 * @since 0.1.0
 */
import { CalendarEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

/**
 * Placeholder table for the calendar slice.
 *
 * Uses Table.make factory to include standard audit columns
 * (id, createdAt, updatedAt).
 *
 * @since 0.1.0
 * @category tables
 */
export const placeholder = Table.make(CalendarEntityIds.PlaceholderId)(
  {
    name: pg.text("name").notNull(),
    description: pg.text("description"),
  },
  (t) => [pg.index("calendar_placeholder_name_idx").on(t.name)]
);
