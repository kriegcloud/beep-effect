import type { DocumentsDb } from "@beep/documents-server/db";
import type { Db } from "@beep/shared-server/Db";
import * as Layer from "effect/Layer";
import { CommentRepo, DiscussionRepo, DocumentFileRepo, DocumentRepo, DocumentVersionRepo } from "./repos";

export type DocumentsRepos = CommentRepo | DiscussionRepo | DocumentFileRepo | DocumentRepo | DocumentVersionRepo;

export type DocumentsReposLive = Layer.Layer<DocumentsRepos, never, Db.SliceDbRequirements | DocumentsDb.DocumentsDb>;

export const layer: DocumentsReposLive = Layer.mergeAll(
  CommentRepo.Default,
  DiscussionRepo.Default,
  DocumentFileRepo.Default,
  DocumentRepo.Default,
  DocumentVersionRepo.Default
);

export * from "./repos";
