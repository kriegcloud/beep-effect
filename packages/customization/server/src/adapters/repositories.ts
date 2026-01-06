import type { CustomizationDb } from "@beep/customization-server/db";
import type { Db } from "@beep/shared-server/Db";
import * as Layer from "effect/Layer";
import { UserHotkeyRepo } from "./repos";

export type CustomizationRepos = UserHotkeyRepo;

export type CustomizationReposLive = Layer.Layer<
  CustomizationRepos,
  never,
  Db.SliceDbRequirements | CustomizationDb.CustomizationDb
>;

export const layer: CustomizationReposLive = Layer.mergeAll(UserHotkeyRepo.Default);

export * from "./repos";
