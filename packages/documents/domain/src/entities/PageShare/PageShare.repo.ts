import { $DocumentsDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as PageShare from "./PageShare.model";

const $I = $DocumentsDomainId.create("entities/PageShare/PageShare.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof PageShare.Model>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
