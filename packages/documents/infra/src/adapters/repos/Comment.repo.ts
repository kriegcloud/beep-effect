import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/documents-domain";
import { dependencies } from "@beep/documents-infra/adapters/repos/_common";
import { DocumentsDb } from "@beep/documents-infra/db";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class CommentRepo extends Effect.Service<CommentRepo>()("@beep/documents-infra/adapters/repos/CommentRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    DocumentsEntityIds.CommentId,
    Entities.Comment.Model,
    Effect.gen(function* () {
      yield* DocumentsDb.DocumentsDb;

      return {};
    })
  ),
}) {}
