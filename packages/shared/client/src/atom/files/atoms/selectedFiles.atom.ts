import type { SharedEntityIds } from "@beep/shared-domain";
import { Atom } from "@effect-atom/atom-react";
import * as A from "effect/Array";

export const selectedFilesAtom = Atom.make({
  folderIds: A.empty<SharedEntityIds.FolderId.Type>(),
  fileIds: A.empty<SharedEntityIds.FileId.Type>(),
});
