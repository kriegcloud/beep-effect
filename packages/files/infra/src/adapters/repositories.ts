import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import type * as Layer from "effect/Layer";
import { FileRepo } from "./repos";

export type FilesRepos = FileRepo;

export type FilesReposLive = Layer.Layer<FilesRepos, SqlError | ConfigError, SqlClient>;

export const layer: FilesReposLive = FileRepo.Default;

export * from "./repos";
