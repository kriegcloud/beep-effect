import type { DbPool } from "@beep/core-db/db.pool";
import { FilesRepos } from "@beep/files-infra";
import { IamRepos } from "@beep/iam-infra";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Layer from "effect/Layer";
export type SliceRepositories = IamRepos.IamRepos | FilesRepos.FileRepos;

export type SliceRepositoriesLive = Layer.Layer<SliceRepositories, ConfigError | SqlError, SqlClient | DbPool>;
export const SliceRepositoriesLive = Layer.mergeAll(IamRepos.IamReposLive, FilesRepos.FilesReposLive);
