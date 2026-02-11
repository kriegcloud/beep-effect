import { $IamDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as OrganizationRole from "./OrganizationRole.model";

const $I = $IamDomainId.create("entities/OrganizationRole/OrganizationRole.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof OrganizationRole.Model, {}>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
