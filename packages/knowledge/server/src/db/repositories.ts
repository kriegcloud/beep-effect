import type { KnowledgeDb } from "./Db";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as repos from "./repos";

export type Repos = repos.ClassDefinitionRepo | repos.EmbeddingRepo | repos.OntologyRepo | repos.PropertyDefinitionRepo;

export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements | KnowledgeDb.Db>;

export const layer: ReposLayer = Layer.mergeAll(
  repos.ClassDefinitionRepo.Default,
  repos.EmbeddingRepo.Default,
  repos.OntologyRepo.Default,
  repos.PropertyDefinitionRepo.Default
);

export * from "./repos";
