import { $CommsDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as EmailTemplate from "./EmailTemplate.model";

const $I = $CommsDomainId.create("entities/EmailTemplate/EmailTemplate.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof EmailTemplate.Model>;
export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
