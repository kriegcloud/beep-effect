import type { CustomizationDb } from "@beep/customization-server/db";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as repos from "./repos";

export type Repos = repos.UserHotkeyRepo;

export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements | CustomizationDb.Db>;

export const layer: ReposLayer = Layer.mergeAll(repos.UserHotkeyRepo.Default);

export * from "./repos";
