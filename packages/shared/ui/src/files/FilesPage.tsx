"use client";
import { activeUploadsAtom, filesAtom } from "@beep/shared-client/atom";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { FilesEmptyState } from "./FilesEmptyState.tsx";
// import { FolderSection } from "./folder";
import { RootFilesSection } from "./RootFilesSection.tsx";

export const FilesPage = () => {
  const filesResult = useAtomValue(filesAtom);
  const activeUploads = useAtomValue(activeUploadsAtom);
  const pendingRootUploads = F.pipe(
    activeUploads,
    A.filter((u) => u.folderId === null)
  );
  const hasPendingRootUploads = pendingRootUploads.length > 0;

  return Result.builder(filesResult)
    .onSuccess(({ rootFiles, folders }) => {
      const hasRootFiles = rootFiles.length > 0 || hasPendingRootUploads;
      const hasFolders = folders.length > 0;
      const hasContent = hasRootFiles || hasFolders;

      if (!hasContent && !filesResult.waiting) {
        return <FilesEmptyState />;
      }

      return (
        <div className="flex flex-col gap-4">
          {hasRootFiles ? <RootFilesSection files={rootFiles} /> : null}

          {F.pipe(
            folders,
            A.map(
              (_folder) => <p>hello</p> //<FolderSection key={folder.id} folder={folder} />
            )
          )}
        </div>
      );
    })
    .onFailure(() => (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-destructive bg-destructive/5 px-6 py-12 text-center">
        <h3 className="mb-2 text-lg font-semibold text-destructive">Unable to Load Files</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          We couldn't load your files right now. Please try again.
        </p>
      </div>
    ))
    .orNull();
};
