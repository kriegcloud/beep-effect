import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/knowledge-management-domain";
import { dependencies } from "@beep/knowledge-management-infra/adapters/repos/_common";
import { KnowledgeManagementDb } from "@beep/knowledge-management-infra/db";
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class DiscussionRepo extends Effect.Service<DiscussionRepo>()(
  "@beep/knowledge-management-infra/adapters/repos/DiscussionRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      KnowledgeManagementEntityIds.DiscussionId,
      Entities.Discussion.Model,
      Effect.gen(function* () {
        yield* KnowledgeManagementDb.KnowledgeManagementDb;

        return {};
      })
    ),
  }
) {}
