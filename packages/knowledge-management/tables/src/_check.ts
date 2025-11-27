import type {
  Comment,
  Discussion,
  Document,
  DocumentFile,
  DocumentVersion,
  KnowledgeBlock,
  KnowledgePage,
  KnowledgeSpace,
  PageLink,
} from "@beep/knowledge-management-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./schema";

// KnowledgeSpace type checks
export const _checkSelectKnowledgeSpace: typeof KnowledgeSpace.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.knowledgeSpace
>;

export const _checkInsertKnowledgeSpace: typeof KnowledgeSpace.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.knowledgeSpace
>;

// KnowledgePage type checks
export const _checkSelectKnowledgePage: typeof KnowledgePage.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.knowledgePage
>;

export const _checkInsertKnowledgePage: typeof KnowledgePage.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.knowledgePage
>;

// KnowledgeBlock type checks
export const _checkSelectKnowledgeBlock: typeof KnowledgeBlock.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.knowledgeBlock
>;

export const _checkInsertKnowledgeBlock: typeof KnowledgeBlock.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.knowledgeBlock
>;

// PageLink type checks
export const _checkSelectPageLink: typeof PageLink.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.pageLink
>;

export const _checkInsertPageLink: typeof PageLink.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.pageLink
>;

// Document type checks
export const _checkSelectDocument: typeof Document.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.document
>;

export const _checkInsertDocument: typeof Document.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.document
>;

// DocumentVersion type checks
export const _checkSelectDocumentVersion: typeof DocumentVersion.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.documentVersion
>;

export const _checkInsertDocumentVersion: typeof DocumentVersion.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.documentVersion
>;

// Discussion type checks
export const _checkSelectDiscussion: typeof Discussion.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.discussion
>;

export const _checkInsertDiscussion: typeof Discussion.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.discussion
>;

// Comment type checks
export const _checkSelectComment: typeof Comment.Model.select.Encoded = {} as InferSelectModel<typeof tables.comment>;

export const _checkInsertComment: typeof Comment.Model.insert.Encoded = {} as InferInsertModel<typeof tables.comment>;

// DocumentFile type checks
export const _checkSelectDocumentFile: typeof DocumentFile.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.documentFile
>;

export const _checkInsertDocumentFile: typeof DocumentFile.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.documentFile
>;
