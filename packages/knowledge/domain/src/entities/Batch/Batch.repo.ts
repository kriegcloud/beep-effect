import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Batch from "./Batch.model";

const $I = $KnowledgeDomainId.create("entities/Batch/Batch.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof Batch.Model>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
