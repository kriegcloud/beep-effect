import { $SharedDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as User from "./User.model";

const $I = $SharedDomainId.create("entities/User/User.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof User.Model>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
