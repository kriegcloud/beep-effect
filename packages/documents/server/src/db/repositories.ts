import type { DocumentsDb } from "@beep/documents-server/db";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as repos from "./repos";

export type Repos =
  | repos.CommentRepo
  | repos.DiscussionRepo
  | repos.DocumentFileRepo
  | repos.DocumentSourceRepo
  | repos.DocumentRepo
  | repos.DocumentVersionRepo;

export type RepoLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements | DocumentsDb.Db>;

export const layer: RepoLayer = Layer.mergeAll(
  repos.CommentRepo.Default,
  repos.DiscussionRepo.Default,
  repos.DocumentFileRepo.Default,
  repos.DocumentSourceRepo.Default,
  repos.DocumentRepo.Default,
  repos.DocumentVersionRepo.Default
);

export * from "./repos";
