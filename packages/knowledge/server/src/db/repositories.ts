import type { KnowledgeDb } from "@beep/knowledge-server/db";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as repos from "./repos";

export type Repos = repos.EmbeddingRepo;

export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements | KnowledgeDb.Db>;

export const layer: ReposLayer = Layer.mergeAll(repos.EmbeddingRepo.Default);

export * from "./repos";
