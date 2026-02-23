import type { Comment, Discussion, Document, DocumentFile, DocumentVersion } from "@beep/documents-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./schema";

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
