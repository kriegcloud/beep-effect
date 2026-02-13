import type { Entities } from "@beep/workspaces-domain";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as Live from "../entities";

export type Repos =
  | Entities.Comment.Repo
  | Entities.Discussion.Repo
  | Entities.DocumentFile.Repo
  | Entities.DocumentSource.Repo
  | Entities.DocumentVersion.Repo
  | Entities.Page.Repo;

export type RepoLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements>;

export const layer: RepoLayer = Layer.mergeAll(
  Live.CommentLive.RepoLive,
  Live.DiscussionLive.RepoLive,
  Live.DocumentFileLive.RepoLive,
  Live.DocumentSourceLive.RepoLive,
  Live.DocumentVersionLive.RepoLive,
  Live.PageLive.RepoLive
);
