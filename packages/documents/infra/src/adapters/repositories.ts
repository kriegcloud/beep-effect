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

export type DocumentsRepos =
  | CommentRepo
  | DiscussionRepo
  | DocumentFileRepo
  | DocumentRepo
  | DocumentVersionRepo
  | KnowledgeBlockRepo
  | KnowledgePageRepo
  | KnowledgeSpaceRepo
  | PageLinkRepo;

export type DocumentsReposLive = Layer.Layer<DocumentsRepos, SqlError | ConfigError, SqlClient>;

export const layer: DocumentsReposLive = Layer.mergeAll(
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
