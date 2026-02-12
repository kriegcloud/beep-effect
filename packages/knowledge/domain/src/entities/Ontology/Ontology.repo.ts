import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Ontology from "./Ontology.model";

const $I = $KnowledgeDomainId.create("entities/Ontology/Ontology.repo");

export type RepoShape = DbRepo.DbRepoSuccess<typeof Ontology.Model, {}>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
