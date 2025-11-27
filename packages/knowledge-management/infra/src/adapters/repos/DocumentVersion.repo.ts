import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/knowledge-management-domain";
import { dependencies } from "@beep/knowledge-management-infra/adapters/repos/_common";
import { KnowledgeManagementDb } from "@beep/knowledge-management-infra/db";
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class DocumentVersionRepo extends Effect.Service<DocumentVersionRepo>()(
  "@beep/knowledge-management-infra/adapters/repos/DocumentVersionRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      KnowledgeManagementEntityIds.DocumentVersionId,
      Entities.DocumentVersion.Model,
      Effect.gen(function* () {
        yield* KnowledgeManagementDb.KnowledgeManagementDb;

        return {};
      })
    ),
  }
) {}
