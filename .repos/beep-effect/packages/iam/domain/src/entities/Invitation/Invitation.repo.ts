import { $IamDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Invitation from "./Invitation.model";

const $I = $IamDomainId.create("entities/Invitation/Invitation.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof Invitation.Model>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
