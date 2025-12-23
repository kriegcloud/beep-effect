import type { SharedEntityIds } from "@beep/shared-domain";
import { Registry } from "@effect-atom/atom-react";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { runtime } from "../runtime.ts";
import { selectedFilesAtom } from "./selectedFiles.atom.ts";

export const toggleFileSelectionAtom = runtime.fn(
  Effect.fnUntraced(function* (fileId: SharedEntityIds.FileId.Type) {
    const registry = yield* Registry.AtomRegistry;
    const current = registry.get(selectedFilesAtom);
    registry.set(selectedFilesAtom, {
      ...current,
      fileIds: A.contains(current.fileIds, fileId)
        ? A.filter(current.fileIds, (id) => id !== fileId)
        : A.append(current.fileIds, fileId),
    });
  })
);
