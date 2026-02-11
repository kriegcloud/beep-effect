import { $IamDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as SsoProvider from "./SsoProvider.model";

const $I = $IamDomainId.create("entities/SsoProvider/SsoProvider.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof SsoProvider.Model, {}>;
export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
