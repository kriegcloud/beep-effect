import { FilesApi } from "@beep/shared-client/atom/services";
import { Registry } from "@effect-atom/atom-react";
import { Effect } from "effect";
import * as A from "effect/Array";
import { runtime } from "../runtime";
import { DeleteFiles, DeleteFolders } from "../types";
import { filesAtom } from "./files.atom";
import { selectedFilesAtom } from "./selectedFiles.atom";

export const deleteFilesAtom = runtime.fn(
  Effect.fn(function* () {
    const registry = yield* Registry.AtomRegistry;
    const api = yield* FilesApi.Service;
    const { fileIds, folderIds } = registry.get(selectedFilesAtom);
    yield* Effect.zip(
      api.deleteFiles({ fileIds }).pipe(Effect.unless(() => A.isEmptyArray(fileIds))),
      api.deleteFolders({ folderIds }).pipe(Effect.unless(() => A.isEmptyArray(folderIds))),
      {
        concurrent: true,
      }
    );

    if (A.isNonEmptyArray(folderIds)) {
      registry.set(filesAtom, DeleteFolders({ folderIds }));
    }
    if (A.isNonEmptyArray(fileIds)) {
      registry.set(filesAtom, DeleteFiles({ fileIds }));
    }

    registry.refresh(selectedFilesAtom);
  })
);
