import { $IamDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Passkey from "./Passkey.model";

const $I = $IamDomainId.create("entities/Passkey/Passkey.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof Passkey.Model, {}>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
