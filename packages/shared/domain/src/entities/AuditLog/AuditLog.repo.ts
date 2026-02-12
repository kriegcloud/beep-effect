import { $SharedDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as AuditLog from "./AuditLog.model";

const $I = $SharedDomainId.create("entities/AuditLog/AuditLog.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof AuditLog.Model>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
