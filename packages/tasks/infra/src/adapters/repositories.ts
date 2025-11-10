import { TodoRepo } from "@beep/tasks-infra/adapters/repos/Todo.repo";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import type * as Layer from "effect/Layer";

export const layer: Layer.Layer<TodoRepo, SqlError | ConfigError, SqlClient> = TodoRepo.Default;

export * from "./repos";
