import { FileRepo } from "@beep/shared-domain/File";
import type { SqlClient } from "@effect/sql/SqlClient";
import * as Layer from "effect/Layer";

export type FilesRepos = FileRepo;

export type FilesReposLive = Layer.Layer<FilesRepos, never, SqlClient>;

export const FilesReposLive = Layer.mergeAll(FileRepo.Default);

export { FileRepo } from "@beep/shared-domain/File";
