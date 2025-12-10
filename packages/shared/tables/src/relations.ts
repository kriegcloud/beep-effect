import * as d from "drizzle-orm";
import { file, folder, organization, session, team, user } from "./tables";

export const organizationRelations = d.relations(organization, ({ many, one }) => ({
  owner: one(user, {
    fields: [organization.ownerUserId],
    references: [user.id],
  }),
  teams: many(team),
  folders: many(folder),
  files: many(file),
}));

export const folderRelations = d.relations(folder, ({ one, many }) => ({
  organization: one(organization, {
    fields: [folder.organizationId],
    references: [organization.id],
  }),
  files: many(file),
  userId: one(user, {
    fields: [folder.userId],
    references: [user.id],
  }),
}));

export const userRelations = d.relations(user, ({ many }) => ({
  ownedOrganizations: many(organization),
  sessions: many(session, {
    relationName: "sessions",
  }),
  folders: many(folder),
  files: many(file),
  uploadedFiles: many(file, {
    relationName: "uploadedFiles",
  }),
  uploadedFolders: many(folder, {
    relationName: "uploadedFolders",
  }),
  uploadedByFiles: many(file, {
    relationName: "uploadedByFiles",
  }),
  uploadedByFolders: many(folder, {
    relationName: "uploadedByFolders",
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
  folder: one(folder, {
    fields: [file.folderId],
    references: [folder.id],
  }),
  userId: one(user, {
    fields: [file.userId],
    references: [user.id],
  }),
  uploadedByUserId: one(user, {
    fields: [file.uploadedByUserId],
    references: [user.id],
    relationName: "uploadedByUser",
  }),
}));

export const sessionRelations = d.relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));
