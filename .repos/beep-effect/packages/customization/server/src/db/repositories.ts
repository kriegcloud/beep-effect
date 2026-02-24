import type { Entities } from "@beep/customization-domain";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as Live from "../entities";

export type Repos = Entities.UserHotkey.Repo;

export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements>;

export const layer: ReposLayer = Layer.mergeAll(Live.UserHotkeyLive.RepoLive);
