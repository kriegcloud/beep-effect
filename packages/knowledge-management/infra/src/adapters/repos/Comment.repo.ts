import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/knowledge-management-domain";
import { dependencies } from "@beep/knowledge-management-infra/adapters/repos/_common";
import { KnowledgeManagementDb } from "@beep/knowledge-management-infra/db";
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class CommentRepo extends Effect.Service<CommentRepo>()(
  "@beep/knowledge-management-infra/adapters/repos/CommentRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      KnowledgeManagementEntityIds.CommentId,
      Entities.Comment.Model,
      Effect.gen(function* () {
        yield* KnowledgeManagementDb.KnowledgeManagementDb;

        return {};
      })
    ),
  }
) {}
