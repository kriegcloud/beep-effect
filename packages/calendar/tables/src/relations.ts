/**
 * Calendar table relations
 *
 * Defines Drizzle relations between tables in this slice.
 *
 * @module calendar-tables/relations
 * @since 0.1.0
 */
import * as d from "drizzle-orm";
import { calendarEvent } from "./tables/calendar-event.table.ts";

/**
 * CalendarEvent table relations.
 *
 * Add foreign key relationships here as needed.
 *
 * @since 0.1.0
 * @category relations
 */
export const calendarEventRelations = d.relations(calendarEvent, (_) => ({
  // Define foreign key relationships here
  // Example:
  // user: one(user, {
  //   fields: [calendarEvent.userId],
  //   references: [user.id],
  // }),
}));

// Define relations here
// Example: import { myEntityTable } from "./tables/my-entity.table";
// export const myEntityRelations = d.relations(myEntityTable, ({ one, many }) => ({
//   // Define foreign key relationships
// }));
