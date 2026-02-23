/**
 * Comms table relations
 *
 * Defines Drizzle relations between tables in this slice.
 *
 * @module comms-tables/relations
 * @since 0.1.0
 */

import { emailTemplate } from "@beep/comms-tables/tables/email-template.table";
import { organization, user } from "@beep/shared-tables";
import * as d from "drizzle-orm";

/**
 * Placeholder table relations.
 *
 * Add foreign key relationships here as needed.
 *
 * @since 0.1.0
 * @category relations
 */
export const emailTemplateRelations = d.relations(emailTemplate, ({ one }) => ({
  // Define foreign key relationships here
  // Example:
  user: one(user, {
    fields: [emailTemplate.userId],
    references: [user._rowId],
  }),
  organization: one(organization, {
    fields: [emailTemplate.organizationId],
    references: [organization.id],
  }),
}));
