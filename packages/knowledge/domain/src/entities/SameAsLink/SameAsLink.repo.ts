import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as SameAsLink from "./SameAsLink.model";
import type {
  CountMembers,
  Delete,
  DeleteByCanonical,
  FindByCanonical,
  FindByMember,
  FindBySource,
  FindHighConfidence,
  ResolveCanonical,
} from "./contracts";

const $I = $KnowledgeDomainId.create("entities/SameAsLink/SameAsLink.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof SameAsLink.Model,
  {
    readonly findByCanonical: DbRepo.Method<{
      payload: typeof FindByCanonical.Payload;
      success: typeof FindByCanonical.Success;
    }>;
    readonly findByMember: DbRepo.Method<{
      payload: typeof FindByMember.Payload;
      success: typeof FindByMember.Success;
    }>;
    readonly resolveCanonical: DbRepo.Method<{
      payload: typeof ResolveCanonical.Payload;
      success: typeof ResolveCanonical.Success;
    }>;
    readonly findHighConfidence: DbRepo.Method<{
      payload: typeof FindHighConfidence.Payload;
      success: typeof FindHighConfidence.Success;
    }>;
    readonly findBySource: DbRepo.Method<{
      payload: typeof FindBySource.Payload;
      success: typeof FindBySource.Success;
    }>;
    readonly deleteByCanonical: DbRepo.Method<{
      payload: typeof DeleteByCanonical.Payload;
      success: typeof DeleteByCanonical.Success;
    }>;
    readonly countMembers: DbRepo.Method<{
      payload: typeof CountMembers.Payload;
      success: typeof CountMembers.Success;
    }>;
    readonly hardDelete: DbRepo.Method<{
      payload: typeof Delete.Payload;
      success: typeof Delete.Success;
      failure: typeof Delete.Failure;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
