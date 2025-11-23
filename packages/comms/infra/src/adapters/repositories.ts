import { EmailTemplateRepo } from "@beep/comms-infra/adapters/repos/EmailTemplate.repo";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import type * as Layer from "effect/Layer";

export type CommsRepos = EmailTemplateRepo;

export type CommsReposLive = Layer.Layer<CommsRepos, SqlError | ConfigError, SqlClient>;
export const layer: CommsReposLive = EmailTemplateRepo.Default;

export * from "./repos";
