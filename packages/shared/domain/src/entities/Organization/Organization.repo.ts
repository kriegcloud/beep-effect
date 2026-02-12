import { $SharedDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Organization from "./Organization.model";

const $I = $SharedDomainId.create("entities/Organization/Organization.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof Organization.Model>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
