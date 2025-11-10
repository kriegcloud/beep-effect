import * as d from "drizzle-orm";
import { organization, team, todo, user } from "./tables";

export const todoRelations = d.relations(todo, ({ one }) => ({
  author: one(user, {
    fields: [todo.author],
    references: [user.id],
  }),
  team: one(team, {
    fields: [todo.team],
    references: [team.id],
  }),
  organization: one(organization, {
    fields: [todo.organizationId],
    references: [organization.id],
  }),
}));
