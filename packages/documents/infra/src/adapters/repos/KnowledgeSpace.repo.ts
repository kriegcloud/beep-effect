import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/documents-domain";
import { dependencies } from "@beep/documents-infra/adapters/repos/_common";
import { DocumentsDb } from "@beep/documents-infra/db";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class KnowledgeSpaceRepo extends Effect.Service<KnowledgeSpaceRepo>()(
  "@beep/documents-infra/adapters/repos/KnowledgeSpaceRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      DocumentsEntityIds.KnowledgeSpaceId,
      Entities.KnowledgeSpace.Model,
      Effect.gen(function* () {
        yield* DocumentsDb.DocumentsDb;
        // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

        return {
          // list,
        };
      })
    ),
  }
) {}
