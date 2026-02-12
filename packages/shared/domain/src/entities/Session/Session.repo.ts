import { $SharedDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Session from "./Session.model";

const $I = $SharedDomainId.create("entities/Session/Session.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof Session.Model>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
