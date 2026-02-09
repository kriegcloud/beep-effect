import * as d from "drizzle-orm";
import { batchExecution } from "./tables/batch-execution.table";
import { emailThread } from "./tables/email-thread.table";
import { emailThreadMessage } from "./tables/email-thread-message.table";
import { embedding } from "./tables/embedding.table";
import { entity } from "./tables/entity.table";
import { extraction } from "./tables/extraction.table";
import { meetingPrepBullet } from "./tables/meeting-prep-bullet.table";
import { meetingPrepEvidence } from "./tables/meeting-prep-evidence.table";
import { mention } from "./tables/mention.table";
import { ontology } from "./tables/ontology.table";
import { relation } from "./tables/relation.table";
import { relationEvidence } from "./tables/relation-evidence.table";
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

export const relationEvidenceRelations = d.relations(relationEvidence, ({ one }) => ({
  relation: one(relation, {
    fields: [relationEvidence.relationId],
    references: [relation.id],
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

export const meetingPrepBulletRelations = d.relations(meetingPrepBullet, ({ many }) => ({
  evidence: many(meetingPrepEvidence),
}));

export const meetingPrepEvidenceRelations = d.relations(meetingPrepEvidence, ({ one }) => ({
  bullet: one(meetingPrepBullet, {
    fields: [meetingPrepEvidence.bulletId],
    references: [meetingPrepBullet.id],
  }),
  mention: one(mention, {
    fields: [meetingPrepEvidence.mentionId],
    references: [mention.id],
  }),
  relationEvidence: one(relationEvidence, {
    fields: [meetingPrepEvidence.relationEvidenceId],
    references: [relationEvidence.id],
  }),
}));

export const emailThreadRelations = d.relations(emailThread, ({ many }) => ({
  messages: many(emailThreadMessage),
}));

export const emailThreadMessageRelations = d.relations(emailThreadMessage, ({ one }) => ({
  thread: one(emailThread, {
    fields: [emailThreadMessage.threadId],
    references: [emailThread.id],
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
