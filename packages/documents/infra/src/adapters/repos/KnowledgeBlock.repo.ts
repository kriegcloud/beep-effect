import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/documents-domain";
import { dependencies } from "@beep/documents-infra/adapters/repos/_common";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class KnowledgeBlockRepo extends Effect.Service<KnowledgeBlockRepo>()(
  "@beep/documents-infra/adapters/repos/KnowledgeBlockRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(DocumentsEntityIds.KnowledgeBlockId, Entities.KnowledgeBlock.Model),
  }
) {}
