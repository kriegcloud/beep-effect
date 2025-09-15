import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import type * as Layer from "effect/Layer";
import { FileRepo } from "./repos";
export const layer: Layer.Layer<FileRepo, SqlError | ConfigError, SqlClient> = FileRepo.Default;

export * from "./repos";
