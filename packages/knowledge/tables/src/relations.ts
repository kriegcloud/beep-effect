import * as d from "drizzle-orm";
import { batchExecution } from "./tables/batch-execution.table";
import { embedding } from "./tables/embedding.table";
import { entity } from "./tables/entity.table";
import { extraction } from "./tables/extraction.table";
import { mention } from "./tables/mention.table";
import { ontology } from "./tables/ontology.table";
import { relation } from "./tables/relation.table";
import { workflowActivity } from "./tables/workflow-activity.table";
import { workflowExecution } from "./tables/workflow-execution.table";
import { workflowSignal } from "./tables/workflow-signal.table";

export const embeddingRelations = d.relations(embedding, (_) => ({}));

export const entityRelations = d.relations(entity, ({ many }) => ({
  mentions: many(mention),
  outgoingRelations: many(relation),
}));

export const relationRelations = d.relations(relation, ({ one }) => ({
  subject: one(entity, {
    fields: [relation.subjectId],
    references: [entity.id],
  }),
  object: one(entity, {
    fields: [relation.objectId],
    references: [entity.id],
  }),
}));

export const ontologyRelations = d.relations(ontology, ({ many }) => ({
  extractions: many(extraction),
}));

export const extractionRelations = d.relations(extraction, ({ one, many }) => ({
  ontology: one(ontology, {
    fields: [extraction.ontologyId],
    references: [ontology.id],
  }),
  mentions: many(mention),
}));

export const mentionRelations = d.relations(mention, ({ one }) => ({
  entity: one(entity, {
    fields: [mention.entityId],
    references: [entity.id],
  }),
}));

export const batchExecutionRelations = d.relations(batchExecution, (_) => ({}));

export const workflowExecutionRelations = d.relations(workflowExecution, ({ many }) => ({
  activities: many(workflowActivity),
  signals: many(workflowSignal),
}));

export const workflowActivityRelations = d.relations(workflowActivity, ({ one }) => ({
  execution: one(workflowExecution, {
    fields: [workflowActivity.executionId],
    references: [workflowExecution.id],
  }),
}));

export const workflowSignalRelations = d.relations(workflowSignal, ({ one }) => ({
  execution: one(workflowExecution, {
    fields: [workflowSignal.executionId],
    references: [workflowExecution.id],
  }),
}));
