/**
 * Knowledge table relations
 *
 * Defines Drizzle relations between tables in this slice.
 *
 * @module knowledge-tables/relations
 * @since 0.1.0
 */
import * as d from "drizzle-orm";
import { embedding } from "./tables/embedding.table.ts";

/**
 * Embedding table relations.
 *
 * Add foreign key relationships here as needed.
 *
 * @since 0.1.0
 * @category relations
 */
export const embeddingRelations = d.relations(embedding, (_) => ({
  // Define foreign key relationships here
  // Example:
  // user: one(user, {
  //   fields: [embedding.userId],
  //   references: [user.id],
  // }),
}));

// Define relations here
// Example: import { myEntityTable } from "./tables/my-entity.table";
// export const myEntityRelations = d.relations(myEntityTable, ({ one, many }) => ({
//   // Define foreign key relationships
// }));
