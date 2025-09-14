import { FilesRepos } from "@beep/files-domain";
import { IamRepos } from "@beep/iam-domain";
import type { SqlClient } from "@effect/sql/SqlClient";
import * as Layer from "effect/Layer";
export type SliceRepositories = IamRepos.IamRepos | FilesRepos.FilesRepos;

export type SliceRepositoriesLive = Layer.Layer<SliceRepositories, never, SqlClient>;

export const SliceRepositoriesLive: SliceRepositoriesLive = Layer.mergeAll(
  IamRepos.IamReposLive,
  FilesRepos.FilesReposLive
);
