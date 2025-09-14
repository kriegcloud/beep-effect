import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";

export type ServerRuntimeError = ConfigError | SqlError;
