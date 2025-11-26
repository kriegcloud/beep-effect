import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Layer from "effect/Layer";
import { KnowledgeBlockRepo, KnowledgePageRepo, KnowledgeSpaceRepo, PageLinkRepo } from "./repos";

export type KnowledgeManagementRepos = KnowledgeBlockRepo | KnowledgePageRepo | KnowledgeSpaceRepo | PageLinkRepo;

export type KnowledgeManagementReposLive = Layer.Layer<KnowledgeManagementRepos, SqlError | ConfigError, SqlClient>;

export const layer: KnowledgeManagementReposLive = Layer.mergeAll(
  PageLinkRepo.Default,
  KnowledgeBlockRepo.Default,
  KnowledgePageRepo.Default,
  KnowledgeSpaceRepo.Default
);

export * from "./repos";
