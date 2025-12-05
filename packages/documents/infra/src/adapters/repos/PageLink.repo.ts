import { Entities } from "@beep/documents-domain";
import { dependencies } from "@beep/documents-infra/adapters/repos/_common";
import { DocumentsDb } from "@beep/documents-infra/db";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-infra/Repo";
import * as Effect from "effect/Effect";

export class PageLinkRepo extends Effect.Service<PageLinkRepo>()("@beep/documents-infra/adapters/repos/PageLinkRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    DocumentsEntityIds.PageLinkId,
    Entities.PageLink.Model,
    Effect.gen(function* () {
      yield* DocumentsDb.DocumentsDb;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
