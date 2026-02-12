import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as KnowledgeAgent from "./KnowledgeAgent.model";

const $I = $KnowledgeDomainId.create("entities/Agent/KnowledgeAgent.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof KnowledgeAgent.Model, {}>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
