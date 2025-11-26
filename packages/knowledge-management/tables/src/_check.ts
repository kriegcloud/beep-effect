import type {
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
