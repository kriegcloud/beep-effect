import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as EmailThread from "./EmailThread.model";

const $I = $KnowledgeDomainId.create("entities/EmailThread/EmailThread.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof EmailThread.Model, {}>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
