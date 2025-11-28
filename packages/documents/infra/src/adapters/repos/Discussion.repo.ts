import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/documents-domain";
import { dependencies } from "@beep/documents-infra/adapters/repos/_common";
import { DocumentsDb } from "@beep/documents-infra/db";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class DiscussionRepo extends Effect.Service<DiscussionRepo>()(
  "@beep/documents-infra/adapters/repos/DiscussionRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      DocumentsEntityIds.DiscussionId,
      Entities.Discussion.Model,
      Effect.gen(function* () {
        yield* DocumentsDb.DocumentsDb;

        return {};
      })
    ),
  }
) {}
