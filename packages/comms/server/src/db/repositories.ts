import type { CommsDb } from "@beep/comms-server/db";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as repos from "./repos";

export type Repos = repos.EmailTemplateRepo;

export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements | CommsDb.Db>;

export const layer: ReposLayer = Layer.mergeAll(repos.EmailTemplateRepo.Default);

export * from "./repos";
