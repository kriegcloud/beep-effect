import * as d from "drizzle-orm";
import { knowledgeBlock, knowledgePage, knowledgeSpace, organization, pageLink, team, user } from "./tables";

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
