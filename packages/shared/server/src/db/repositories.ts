import type { File, Folder, UploadSession } from "@beep/shared-domain/entities";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as Live from "../entities";

export type Repos = File.Repo | Folder.Repo | UploadSession.Repo;

export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements>;

export const layer: ReposLayer = Layer.mergeAll(
  Live.FileLive.RepoLive,
  Live.FolderLive.RepoLive,
  Live.UploadSessionLive.RepoLive
);
