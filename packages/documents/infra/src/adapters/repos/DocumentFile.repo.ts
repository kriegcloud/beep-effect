import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/documents-domain";
import { dependencies } from "@beep/documents-infra/adapters/repos/_common";
import { DocumentsDb } from "@beep/documents-infra/db";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class DocumentFileRepo extends Effect.Service<DocumentFileRepo>()(
  "@beep/documents-infra/adapters/repos/DocumentFileRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      DocumentsEntityIds.DocumentFileId,
      Entities.DocumentFile.Model,
      Effect.gen(function* () {
        yield* DocumentsDb.DocumentsDb;

        return {};
      })
    ),
  }
) {}
