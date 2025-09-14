import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { FileId } from "../EntityIds/shared";
import { Model } from "./File.model";

export class FileRepo extends Effect.Service<FileRepo>()("FileRepo", {
  effect: M.makeRepository(Model, {
    tableName: FileId.tableName,
    idColumn: "id",
    spanPrefix: "FileRepo",
  }),
}) {}
