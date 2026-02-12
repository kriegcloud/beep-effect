import type { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import type { WorkerHashError } from "@beep/utils/md5";
import type * as Atom from "@effect-atom/atom/Atom";
import { Registry } from "@effect-atom/atom-react";
import { Effect } from "effect";
import * as A from "effect/Array";
import { runtime } from "../runtime";
import { selectedFilesAtom } from "./selectedFiles.atom";
export const clearSelectionAtom: Atom.AtomResultFn<void, void, BS.MetadataParseError | WorkerHashError> = runtime.fn(
  Effect.fnUntraced(function* () {
    const registry = yield* Registry.AtomRegistry;
    registry.set(selectedFilesAtom, {
      folderIds: A.empty<SharedEntityIds.FolderId.Type>(),
      fileIds: A.empty<SharedEntityIds.FileId.Type>(),
    });
  })
);
