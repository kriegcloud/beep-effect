import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import type { SharedDb } from "../Db";
import * as repos from "./repos";

export * from "./repos";

export type Repos = repos.FileRepo | repos.FolderRepo | repos.UploadSessionRepo;

export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements | SharedDb.Db>;

export const layer: ReposLayer = Layer.mergeAll(
  repos.FileRepo.Default,
  repos.FolderRepo.Default,
  repos.UploadSessionRepo.Default
);
