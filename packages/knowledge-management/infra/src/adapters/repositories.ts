import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Layer from "effect/Layer";
import {
  CommentRepo,
  DiscussionRepo,
  DocumentFileRepo,
  DocumentRepo,
  DocumentVersionRepo,
  KnowledgeBlockRepo,
  KnowledgePageRepo,
  KnowledgeSpaceRepo,
  PageLinkRepo,
} from "./repos";

export type KnowledgeManagementRepos =
  | CommentRepo
  | DiscussionRepo
  | DocumentFileRepo
  | DocumentRepo
  | DocumentVersionRepo
  | KnowledgeBlockRepo
  | KnowledgePageRepo
  | KnowledgeSpaceRepo
  | PageLinkRepo;

export type KnowledgeManagementReposLive = Layer.Layer<KnowledgeManagementRepos, SqlError | ConfigError, SqlClient>;

export const layer: KnowledgeManagementReposLive = Layer.mergeAll(
  CommentRepo.Default,
  DiscussionRepo.Default,
  DocumentFileRepo.Default,
  DocumentRepo.Default,
  DocumentVersionRepo.Default,
  KnowledgeBlockRepo.Default,
  KnowledgePageRepo.Default,
  KnowledgeSpaceRepo.Default,
  PageLinkRepo.Default
);

export * from "./repos";
