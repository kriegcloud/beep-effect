import type { DocumentsDb } from "@beep/documents-infra/db";
import type { Db } from "@beep/shared-infra/Db";
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

export type DocumentsReposLive = Layer.Layer<DocumentsRepos, never, Db.PgClientServices | DocumentsDb.DocumentsDb>;

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
