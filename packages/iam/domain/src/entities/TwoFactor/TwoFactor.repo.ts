import { $IamDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as TwoFactor from "./TwoFactor.model";

const $I = $IamDomainId.create("entities/TwoFactor/TwoFactor.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof TwoFactor.Model, {}>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
