import { $CustomizationDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as UserHotkey from "./UserHotkey.model";

const $I = $CustomizationDomainId.create("entities/UserHotkey/UserHotkey.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof UserHotkey.Model>;
export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
