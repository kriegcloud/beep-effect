import { filesAtom } from "@beep/shared-client/atom";
import type { SharedEntityIds } from "@beep/shared-domain";
import { tagPropIs } from "@beep/utils";
import { Registry } from "@effect-atom/atom-react";
import { Effect } from "effect";
import * as A from "effect/Array";
import { FilesApi } from "../../services";
import { runtime } from "../runtime";
import { MoveFiles } from "../types";
import { selectedFilesAtom } from "./selectedFiles.atom";

export const moveFilesAtom = runtime.fn(
  Effect.fn(function* (payload: {
    readonly fileIds: readonly SharedEntityIds.FileId.Type[];
    readonly folderId: SharedEntityIds.FolderId.Type | null;
  }) {
    const registry = yield* Registry.AtomRegistry;
    const api = yield* FilesApi.Service;

    const filesState = registry.get(filesAtom);
    let fromFolderId: SharedEntityIds.FolderId.Type | null = null;

    if (filesState && tagPropIs(filesState, "Success")) {
      const inRoot = A.some(filesState.value.rootFiles, (file) => A.contains(payload.fileIds, file.id));

      if (!inRoot) {
        const sourceFolder = A.findFirst(filesState.value.folders, (folder) =>
          A.some(folder.uploadedFiles, (file) => A.contains(payload.fileIds, file.id))
        );
        if (tagPropIs(sourceFolder, "Some")) {
          fromFolderId = sourceFolder.value.id;
        }
      }
    }

    yield* api.moveFiles(payload);

    registry.set(
      filesAtom,
      MoveFiles({
        fileIds: payload.fileIds,
        fromFolderId,
        toFolderId: payload.folderId,
      })
    );

    registry.refresh(selectedFilesAtom);
  })
);
