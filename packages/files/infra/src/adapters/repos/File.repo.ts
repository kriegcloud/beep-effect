import { dependencies } from "@beep/files-infra/adapters/repos/_common";
import { FilesDb } from "@beep/files-infra/db";
import { SharedEntityIds } from "@beep/shared-domain";
import { File } from "@beep/shared-domain/entities";
import { Repo } from "@beep/shared-domain/Repo";
import * as Effect from "effect/Effect";

export class FileRepo extends Effect.Service<FileRepo>()("@beep/files-infra/adapters/repos/FileRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    SharedEntityIds.FileId,
    File.Model,
    Effect.gen(function* () {
      yield* FilesDb.FilesDb;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.accountTable.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
