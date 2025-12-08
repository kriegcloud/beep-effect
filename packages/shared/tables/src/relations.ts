import * as d from "drizzle-orm";
import { file, organization, session, team, user } from "./tables";

export const organizationRelations = d.relations(organization, ({ many, one }) => ({
  owner: one(user, {
    fields: [organization.ownerUserId],
    references: [user.id],
  }),
  teams: many(team),
}));

export const userRelations = d.relations(user, ({ many }) => ({
  ownedOrganizations: many(organization),
  sessions: many(session, {
    relationName: "sessions",
  }),
}));

export const teamRelations = d.relations(team, ({ one }) => ({
  organization: one(organization, {
    fields: [team.organizationId],
    references: [organization.id],
  }),
}));

export const fileRelations = d.relations(file, ({ one }) => ({
  organization: one(organization, {
    fields: [file.organizationId],
    references: [organization.id],
  }),
}));

export const sessionRelations = d.relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));
