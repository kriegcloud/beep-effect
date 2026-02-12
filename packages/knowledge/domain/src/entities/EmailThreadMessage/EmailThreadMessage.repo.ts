import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as EmailThreadMessage from "./EmailThreadMessage.model";

const $I = $KnowledgeDomainId.create("entities/EmailThreadMessage/EmailThreadMessage.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof EmailThreadMessage.Model, {}>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
