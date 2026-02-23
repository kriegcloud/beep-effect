import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Extraction from "./Extraction.model";

const $I = $KnowledgeDomainId.create("entities/Extraction/Extraction.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof Extraction.Model>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
