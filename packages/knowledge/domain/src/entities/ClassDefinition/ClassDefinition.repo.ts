import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as ClassDefinition from "./ClassDefinition.model";

const $I = $KnowledgeDomainId.create("entities/ClassDefinition/ClassDefinition.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof ClassDefinition.Model>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
