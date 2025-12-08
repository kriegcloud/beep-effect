import type { Db } from "@beep/shared-infra/Db";
import * as Layer from "effect/Layer";
import type { SharedDb } from "../db";
import { FileRepo } from "./File.repo.ts";

export type SharedRepos = FileRepo;

export type SharedReposLive = Layer.Layer<SharedRepos, never, Db.PgClientServices | SharedDb.SharedDb>;

export const layer: SharedReposLive = Layer.mergeAll(FileRepo.Default);

export * from "./File.repo.ts";
