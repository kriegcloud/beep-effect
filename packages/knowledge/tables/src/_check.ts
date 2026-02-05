import type {
  ClassDefinition,
  Embedding,
  Entity,
  EntityCluster,
  Extraction,
  Mention,
  MentionRecord,
  MergeHistory,
  Ontology,
  PropertyDefinition,
  Relation,
  SameAsLink,
} from "@beep/knowledge-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type * as tables from "./schema";

export const _checkSelectClassDefinition: typeof ClassDefinition.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.classDefinition
>;

export const _checkInsertClassDefinition: typeof ClassDefinition.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.classDefinition
>;

export const _checkSelectEmbedding: typeof Embedding.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.embedding
>;

export const _checkInsertEmbedding: typeof Embedding.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.embedding
>;

export const _checkSelectEntity: typeof Entity.Model.select.Encoded = {} as InferSelectModel<typeof tables.entity>;

export const _checkInsertEntity: typeof Entity.Model.insert.Encoded = {} as InferInsertModel<typeof tables.entity>;

export const _checkSelectEntityCluster: typeof EntityCluster.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.entityCluster
>;

export const _checkInsertEntityCluster: typeof EntityCluster.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.entityCluster
>;

export const _checkSelectExtraction: typeof Extraction.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.extraction
>;

export const _checkInsertExtraction: typeof Extraction.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.extraction
>;

export const _checkSelectMention: typeof Mention.Model.select.Encoded = {} as InferSelectModel<typeof tables.mention>;

export const _checkInsertMention: typeof Mention.Model.insert.Encoded = {} as InferInsertModel<typeof tables.mention>;

export const _checkSelectMentionRecord: typeof MentionRecord.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.mentionRecord
>;

export const _checkInsertMentionRecord: typeof MentionRecord.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.mentionRecord
>;

export const _checkSelectMergeHistory: typeof MergeHistory.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.mergeHistory
>;

export const _checkInsertMergeHistory: typeof MergeHistory.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.mergeHistory
>;

export const _checkSelectOntology: typeof Ontology.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.ontology
>;

export const _checkInsertOntology: typeof Ontology.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.ontology
>;

export const _checkSelectPropertyDefinition: typeof PropertyDefinition.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.propertyDefinition
>;

export const _checkInsertPropertyDefinition: typeof PropertyDefinition.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.propertyDefinition
>;

export const _checkSelectRelation: typeof Relation.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.relation
>;

export const _checkInsertRelation: typeof Relation.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.relation
>;

export const _checkSelectSameAsLink: typeof SameAsLink.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.sameAsLink
>;

export const _checkInsertSameAsLink: typeof SameAsLink.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.sameAsLink
>;
