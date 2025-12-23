import type { SharedEntityIds } from "@beep/shared-domain";
import { Registry } from "@effect-atom/atom-react";
import { Effect } from "effect";
import * as A from "effect/Array";
import { runtime } from "../runtime.ts";
import { selectedFilesAtom } from "./selectedFiles.atom.ts";

export const clearSelectionAtom = runtime.fn(
  Effect.fnUntraced(function* () {
    const registry = yield* Registry.AtomRegistry;
    registry.set(selectedFilesAtom, {
      folderIds: A.empty<SharedEntityIds.FolderId.Type>(),
      fileIds: A.empty<SharedEntityIds.FileId.Type>(),
    });
  })
);
