import type { CalendarDb } from "@beep/calendar-server/db";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as repos from "./repos";

export type Repos = repos.PlaceholderRepo;

export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements | CalendarDb.Db>;

export const layer: ReposLayer = Layer.mergeAll(repos.PlaceholderRepo.Default);

export * from "./repos";
