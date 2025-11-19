import * as d from "drizzle-orm";
import { organization, team, emailTemplate, user } from "./tables";

export const emailTemplateRelations = d.relations(emailTemplate, ({ one }) => ({
  user: one(user, {
    fields: [emailTemplate.userId],
    references: [user.id],
  }),
  team: one(team, {
    fields: [emailTemplate.teamId],
    references: [team.id],
  }),
  organization: one(organization, {
    fields: [emailTemplate.organizationId],
    references: [organization.id],
  }),
}));
