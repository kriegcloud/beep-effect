import * as d from "drizzle-orm";
import { comment, discussion, document, documentFile, documentVersion, organization, user } from "./tables";

// Document relations
export const documentRelations = d.relations(document, ({ one, many }) => ({
  organization: one(organization, {
    fields: [document.organizationId],
    references: [organization.id],
  }),
  owner: one(user, {
    fields: [document.userId],
    references: [user.id],
  }),
  parentDocument: one(document, {
    fields: [document.parentDocumentId],
    references: [document.id],
    relationName: "documentHierarchy",
  }),
  childDocuments: many(document, {
    relationName: "documentHierarchy",
  }),
  versions: many(documentVersion),
  discussions: many(discussion),
  files: many(documentFile),
}));

// DocumentVersion relations
export const documentVersionRelations = d.relations(documentVersion, ({ one }) => ({
  organization: one(organization, {
    fields: [documentVersion.organizationId],
    references: [organization.id],
  }),
  document: one(document, {
    fields: [documentVersion.documentId],
    references: [document.id],
  }),
  author: one(user, {
    fields: [documentVersion.userId],
    references: [user.id],
  }),
}));

// Discussion relations
export const discussionRelations = d.relations(discussion, ({ one, many }) => ({
  organization: one(organization, {
    fields: [discussion.organizationId],
    references: [organization.id],
  }),
  document: one(document, {
    fields: [discussion.documentId],
    references: [document.id],
  }),
  author: one(user, {
    fields: [discussion.userId],
    references: [user.id],
  }),
  comments: many(comment),
}));

// Comment relations
export const commentRelations = d.relations(comment, ({ one }) => ({
  organization: one(organization, {
    fields: [comment.organizationId],
    references: [organization.id],
  }),
  discussion: one(discussion, {
    fields: [comment.discussionId],
    references: [discussion.id],
  }),
  author: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
}));

// DocumentFile relations
export const documentFileRelations = d.relations(documentFile, ({ one }) => ({
  organization: one(organization, {
    fields: [documentFile.organizationId],
    references: [organization.id],
  }),
  owner: one(user, {
    fields: [documentFile.userId],
    references: [user.id],
  }),
  document: one(document, {
    fields: [documentFile.documentId],
    references: [document.id],
  }),
}));
