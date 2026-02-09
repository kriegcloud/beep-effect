import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import type { KnowledgeDb } from "./Db";
import * as repos from "./repos";

export type Repos =
  | repos.ClassDefinitionRepo
  | repos.EmbeddingRepo
  | repos.EntityRepo
  | repos.MentionRepo
  | repos.RelationRepo
  | repos.RelationEvidenceRepo
  | repos.MeetingPrepBulletRepo
  | repos.MeetingPrepEvidenceRepo
  | repos.OntologyRepo
  | repos.PropertyDefinitionRepo;

export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements | KnowledgeDb.Db>;

export const layer: ReposLayer = Layer.mergeAll(
  repos.ClassDefinitionRepoLive,
  repos.EmbeddingRepoLive,
  repos.EntityRepoLive,
  repos.MentionRepoLive,
  repos.RelationRepoLive,
  repos.RelationEvidenceRepoLive,
  repos.MeetingPrepBulletRepoLive,
  repos.MeetingPrepEvidenceRepoLive,
  repos.OntologyRepoLive,
  repos.PropertyDefinitionRepoLive
);

export * from "./repos";
