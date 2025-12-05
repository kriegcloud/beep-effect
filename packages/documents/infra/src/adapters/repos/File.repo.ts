import { dependencies } from "@beep/documents-infra/adapters/repos/_common";
import { DocumentsDb } from "@beep/documents-infra/db";
import { SharedEntityIds } from "@beep/shared-domain";
import { File } from "@beep/shared-domain/entities";
import { Repo } from "@beep/shared-infra/Repo";
import * as Effect from "effect/Effect";

export class FileRepo extends Effect.Service<FileRepo>()("@beep/documents-infra/adapters/repos/FileRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    SharedEntityIds.FileId,
    File.Model,
    Effect.gen(function* () {
      yield* DocumentsDb.DocumentsDb;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
