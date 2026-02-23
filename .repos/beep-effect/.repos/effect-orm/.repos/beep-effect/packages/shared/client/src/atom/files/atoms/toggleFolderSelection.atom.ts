import type { SharedEntityIds } from "@beep/shared-domain";
import { Registry } from "@effect-atom/atom-react";
import { Effect } from "effect";
import * as A from "effect/Array";
import { runtime } from "../runtime";
import { selectedFilesAtom } from "./selectedFiles.atom";

export const toggleFolderSelectionAtom = runtime.fn(
  Effect.fnUntraced(function* (payload: {
    readonly folderId: SharedEntityIds.FolderId.Type;
    readonly fileIdsInFolder: readonly SharedEntityIds.FileId.Type[];
  }) {
    const registry = yield* Registry.AtomRegistry;
    const current = registry.get(selectedFilesAtom);
    const isFolderSelected = A.contains(current.folderIds, payload.folderId);

    if (isFolderSelected) {
      registry.set(selectedFilesAtom, {
        folderIds: A.filter(current.folderIds, (id) => id !== payload.folderId),
        fileIds: A.filter(current.fileIds, (fileId) => !A.contains(payload.fileIdsInFolder, fileId)),
      });
    } else {
      registry.set(selectedFilesAtom, {
        folderIds: A.append(current.folderIds, payload.folderId),
        fileIds: A.appendAll(current.fileIds, payload.fileIdsInFolder),
      });
    }
  })
);
