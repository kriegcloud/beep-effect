import { $SharedDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Team from "./Team.model";

const $I = $SharedDomainId.create("entities/Team/Team.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof Team.Model>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
