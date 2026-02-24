import type { Entities } from "@beep/knowledge-domain";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as Live from "../entities";

export type Repos =
  | Entities.Batch.Repo
  | Entities.ClassDefinition.Repo
  | Entities.EmailThread.Repo
  | Entities.EmailThreadMessage.Repo
  | Entities.Embedding.Repo
  | Entities.Entity.Repo
  | Entities.EntityCluster.Repo
  | Entities.Extraction.Repo
  | Entities.KnowledgeAgent.Repo
  | Entities.MeetingPrepBullet.Repo
  | Entities.MeetingPrepEvidence.Repo
  | Entities.Mention.Repo
  | Entities.MentionRecord.Repo
  | Entities.MergeHistory.Repo
  | Entities.Ontology.Repo
  | Entities.PropertyDefinition.Repo
  | Entities.Relation.Repo
  | Entities.RelationEvidence.Repo
  | Entities.SameAsLink.Repo;

export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements>;

export const layer: ReposLayer = Layer.mergeAll(
  Live.BatchLive.RepoLive,
  Live.ClassDefinitionLive.RepoLive,
  Live.EmailThreadLive.RepoLive,
  Live.EmailThreadMessageLive.RepoLive,
  Live.EmbeddingLive.RepoLive,
  Live.EntityLive.RepoLive,
  Live.EntityClusterLive.RepoLive,
  Live.ExtractionLive.RepoLive,
  Live.KnowledgeAgentLive.RepoLive,
  Live.MeetingPrepBulletLive.RepoLive,
  Live.MeetingPrepEvidenceLive.RepoLive,
  Live.MentionLive.RepoLive,
  Live.MentionRecordLive.RepoLive,
  Live.MergeHistoryLive.RepoLive,
  Live.OntologyLive.RepoLive,
  Live.PropertyDefinitionLive.RepoLive,
  Live.RelationLive.RepoLive,
  Live.RelationEvidenceLive.RepoLive,
  Live.SameAsLinkLive.RepoLive
);
