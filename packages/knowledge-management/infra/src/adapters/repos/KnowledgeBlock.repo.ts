import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/knowledge-management-domain";
import { dependencies } from "@beep/knowledge-management-infra/adapters/repos/_common";
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class KnowledgeBlockRepo extends Effect.Service<KnowledgeBlockRepo>()(
  "@beep/knowledge-management-infra/adapters/repos/KnowledgeBlockRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(KnowledgeManagementEntityIds.KnowledgeBlockId, Entities.KnowledgeBlock.Model),
  }
) {}
