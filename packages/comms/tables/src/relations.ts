import { organization, user } from "@beep/shared-tables/schema";
import * as d from "drizzle-orm";
import {
  connection,
  emailTemplate,
  note,
  threadSummary,
  userHotkeys,
  userSettings,
} from "./tables";

export const connectionRelations = d.relations(connection, ({ one, many }) => ({
  user: one(user, {
    fields: [connection.userId],
    references: [user.id],
  }),
  threadSummaries: many(threadSummary),
  notes: many(note),
}));

export const threadSummaryRelations = d.relations(threadSummary, ({ one }) => ({
  connection: one(connection, {
    fields: [threadSummary.connectionId],
    references: [connection.id],
  }),
}));

export const noteRelations = d.relations(note, ({ one }) => ({
  user: one(user, {
    fields: [note.userId],
    references: [user.id],
  }),
  connection: one(connection, {
    fields: [note.connectionId],
    references: [connection.id],
  }),
}));

export const userSettingsRelations = d.relations(userSettings, ({ one }) => ({
  user: one(user, {
    fields: [userSettings.userId],
    references: [user.id],
  }),
}));

export const userHotkeysRelations = d.relations(userHotkeys, ({ one }) => ({
  user: one(user, {
    fields: [userHotkeys.userId],
    references: [user.id],
  }),
}));

export const emailTemplateRelations = d.relations(emailTemplate, ({ one }) => ({
  user: one(user, {
    fields: [emailTemplate.userId],
    references: [user._rowId],
  }),
  organization: one(organization, {
    fields: [emailTemplate.organizationId],
    references: [organization.id],
  }),
}));
