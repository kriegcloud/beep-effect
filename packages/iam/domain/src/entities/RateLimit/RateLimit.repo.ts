import { $IamDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as RateLimit from "./RateLimit.model";

const $I = $IamDomainId.create("entities/RateLimit/RateLimit.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof RateLimit.Model, {}>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
