import * as d from "drizzle-orm";
import { comment, discussion, document, documentFile, documentVersion, organization, page, user } from "./tables";

// User relations (redefined for bounded context integrity)
export const userRelations = d.relations(user, ({ many }) => ({
  documents: many(document, { relationName: "documentOwner" }),
  documentVersions: many(documentVersion, { relationName: "documentVersionAuthor" }),
  discussions: many(discussion, { relationName: "discussionAuthor" }),
  comments: many(comment, { relationName: "commentAuthor" }),
  documentFiles: many(documentFile, { relationName: "documentFileOwner" }),
  pages: many(page, { relationName: "pageCreatedBy" }),
}));

// Organization relations (redefined for bounded context integrity)
export const organizationRelations = d.relations(organization, ({ many }) => ({
  documents: many(document, { relationName: "documentOrganization" }),
  documentVersions: many(documentVersion, { relationName: "documentVersionOrganization" }),
  discussions: many(discussion, { relationName: "discussionOrganization" }),
  comments: many(comment, { relationName: "commentOrganization" }),
  documentFiles: many(documentFile, { relationName: "documentFileOrganization" }),
  pages: many(page, { relationName: "pageOrganization" }),
}));

// Document relations
export const documentRelations = d.relations(document, ({ one, many }) => ({
  organization: one(organization, {
    fields: [document.organizationId],
    references: [organization.id],
    relationName: "documentOrganization",
  }),
  owner: one(user, {
    fields: [document.userId],
    references: [user.id],
    relationName: "documentOwner",
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

// Page relations
export const pageRelations = d.relations(page, ({ one, many }) => ({
  organization: one(organization, {
    fields: [page.organizationId],
    references: [organization.id],
    relationName: "pageOrganization",
  }),
  createdBy: one(user, {
    fields: [page.createdById],
    references: [user.id],
    relationName: "pageCreatedBy",
  }),
  parentPage: one(page, {
    fields: [page.parentId],
    references: [page.id],
    relationName: "pageHierarchy",
  }),
  childPages: many(page, {
    relationName: "pageHierarchy",
  }),
}));

// DocumentVersion relations
export const documentVersionRelations = d.relations(documentVersion, ({ one }) => ({
  organization: one(organization, {
    fields: [documentVersion.organizationId],
    references: [organization.id],
    relationName: "documentVersionOrganization",
  }),
  document: one(document, {
    fields: [documentVersion.documentId],
    references: [document.id],
  }),
  author: one(user, {
    fields: [documentVersion.userId],
    references: [user.id],
    relationName: "documentVersionAuthor",
  }),
}));

// Discussion relations
export const discussionRelations = d.relations(discussion, ({ one, many }) => ({
  organization: one(organization, {
    fields: [discussion.organizationId],
    references: [organization.id],
    relationName: "discussionOrganization",
  }),
  document: one(document, {
    fields: [discussion.documentId],
    references: [document.id],
  }),
  author: one(user, {
    fields: [discussion.userId],
    references: [user.id],
    relationName: "discussionAuthor",
  }),
  comments: many(comment, {
    relationName: "discussionComments",
  }),
}));

// Comment relations
export const commentRelations = d.relations(comment, ({ one }) => ({
  organization: one(organization, {
    fields: [comment.organizationId],
    references: [organization.id],
    relationName: "commentOrganization",
  }),
  discussion: one(discussion, {
    fields: [comment.discussionId],
    references: [discussion.id],
  }),
  author: one(user, {
    fields: [comment.userId],
    references: [user.id],
    relationName: "commentAuthor",
  }),
}));

// DocumentFile relations
export const documentFileRelations = d.relations(documentFile, ({ one }) => ({
  organization: one(organization, {
    fields: [documentFile.organizationId],
    references: [organization.id],
    relationName: "documentFileOrganization",
  }),
  owner: one(user, {
    fields: [documentFile.userId],
    references: [user.id],
    relationName: "documentFileOwner",
  }),
  document: one(document, {
    fields: [documentFile.documentId],
    references: [document.id],
  }),
}));
