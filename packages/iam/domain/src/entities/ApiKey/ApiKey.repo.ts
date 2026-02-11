import { $IamDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as ApiKey from "./ApiKey.model";

const $I = $IamDomainId.create("entities/ApiKey/ApiKey.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof ApiKey.Model, {}>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
