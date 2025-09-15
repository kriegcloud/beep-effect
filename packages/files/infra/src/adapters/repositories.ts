import type { DbPool } from "@beep/core-db";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Layer from "effect/Layer";
import { FileRepo } from "./repos";

export type FileRepos = FileRepo;

export type FileReposLive = Layer.Layer<FileRepos, ConfigError | SqlError, SqlClient | DbPool>;

export const FilesReposLive: FileReposLive = Layer.mergeAll(FileRepo.Default);

export * from "./repos";
