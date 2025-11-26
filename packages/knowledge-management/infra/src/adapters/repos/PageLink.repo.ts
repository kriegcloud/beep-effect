import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/knowledge-management-domain";
import { dependencies } from "@beep/knowledge-management-infra/adapters/repos/_common";
import { KnowledgeManagementDb } from "@beep/knowledge-management-infra/db";
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class PageLinkRepo extends Effect.Service<PageLinkRepo>()(
  "@beep/knowledge-management-infra/adapters/repos/PageLinkRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      KnowledgeManagementEntityIds.PageLinkId,
      Entities.PageLink.Model,
      Effect.gen(function* () {
        yield* KnowledgeManagementDb.KnowledgeManagementDb;
        // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

        return {
          // list,
        };
      })
    ),
  }
) {}
