import * as d from "drizzle-orm";
import {
  comment,
  discussion,
  document,
  documentFile,
  documentVersion,
  knowledgeBlock,
  knowledgePage,
  knowledgeSpace,
  organization,
  pageLink,
  team,
  user,
} from "./tables";

// KnowledgeSpace relations
export const knowledgeSpaceRelations = d.relations(knowledgeSpace, ({ one, many }) => ({
  organization: one(organization, {
    fields: [knowledgeSpace.organizationId],
    references: [organization.id],
  }),
  team: one(team, {
    fields: [knowledgeSpace.teamId],
    references: [team.id],
  }),
  owner: one(user, {
    fields: [knowledgeSpace.ownerId],
    references: [user.id],
  }),
  pages: many(knowledgePage),
}));

// KnowledgePage relations
export const knowledgePageRelations = d.relations(knowledgePage, ({ one, many }) => ({
  organization: one(organization, {
    fields: [knowledgePage.organizationId],
    references: [organization.id],
  }),
  space: one(knowledgeSpace, {
    fields: [knowledgePage.spaceId],
    references: [knowledgeSpace.id],
  }),
  parentPage: one(knowledgePage, {
    fields: [knowledgePage.parentPageId],
    references: [knowledgePage.id],
    relationName: "pageHierarchy",
  }),
  childPages: many(knowledgePage, {
    relationName: "pageHierarchy",
  }),
  blocks: many(knowledgeBlock),
  outgoingLinks: many(pageLink, {
    relationName: "sourcePageLinks",
  }),
  incomingLinks: many(pageLink, {
    relationName: "targetPageLinks",
  }),
}));

// KnowledgeBlock relations
export const knowledgeBlockRelations = d.relations(knowledgeBlock, ({ one, many }) => ({
  organization: one(organization, {
    fields: [knowledgeBlock.organizationId],
    references: [organization.id],
  }),
  page: one(knowledgePage, {
    fields: [knowledgeBlock.pageId],
    references: [knowledgePage.id],
  }),
  parentBlock: one(knowledgeBlock, {
    fields: [knowledgeBlock.parentBlockId],
    references: [knowledgeBlock.id],
    relationName: "blockHierarchy",
  }),
  childBlocks: many(knowledgeBlock, {
    relationName: "blockHierarchy",
  }),
  lastEditor: one(user, {
    fields: [knowledgeBlock.lastEditedBy],
    references: [user.id],
  }),
  pageLinks: many(pageLink),
}));

// PageLink relations
export const pageLinkRelations = d.relations(pageLink, ({ one }) => ({
  organization: one(organization, {
    fields: [pageLink.organizationId],
    references: [organization.id],
  }),
  sourcePage: one(knowledgePage, {
    fields: [pageLink.sourcePageId],
    references: [knowledgePage.id],
    relationName: "sourcePageLinks",
  }),
  targetPage: one(knowledgePage, {
    fields: [pageLink.targetPageId],
    references: [knowledgePage.id],
    relationName: "targetPageLinks",
  }),
  sourceBlock: one(knowledgeBlock, {
    fields: [pageLink.sourceBlockId],
    references: [knowledgeBlock.id],
  }),
}));

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

// User relations for documents slice
export const documentsUserRelations = d.relations(user, ({ many }) => ({
  documents: many(document),
  documentVersions: many(documentVersion),
  documentFiles: many(documentFile),
  ownedKnowledgeSpaces: many(knowledgeSpace),
  editedKnowledgeBlocks: many(knowledgeBlock),
  discussions: many(discussion),
  comments: many(comment),
}));

// Organization relations for documents slice
export const documentsOrganizationRelations = d.relations(organization, ({ many }) => ({
  documents: many(document),
  documentVersions: many(documentVersion),
  documentFiles: many(documentFile),
  knowledgeSpaces: many(knowledgeSpace),
  knowledgePages: many(knowledgePage),
  knowledgeBlocks: many(knowledgeBlock),
  pageLinks: many(pageLink),
  discussions: many(discussion),
  comments: many(comment),
}));

// Team relations for documents slice
export const documentsTeamRelations = d.relations(team, ({ many }) => ({
  knowledgeSpaces: many(knowledgeSpace),
}));
