import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as PropertyDefinition from "./PropertyDefinition.model";

const $I = $KnowledgeDomainId.create("entities/PropertyDefinition/PropertyDefinition.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof PropertyDefinition.Model>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
