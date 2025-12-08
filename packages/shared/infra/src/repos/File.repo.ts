import { $SharedInfraId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import { File } from "@beep/shared-domain/entities";
import { Repo } from "@beep/shared-infra/Repo";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = $SharedInfraId.create("repos/File");

export class FileRepo extends Effect.Service<FileRepo>()($I`FileRepo`, {
  dependencies,
  accessors: true,
  effect: Repo.make(SharedEntityIds.FileId, File.Model, Effect.succeed({})),
}) {}
