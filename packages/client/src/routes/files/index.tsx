import { Result, useAtomValue } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import { activeUploadsAtom, filesAtom } from "./-files/files-atoms";
import { FilesEmptyState } from "./-files/files-empty-state";
import { FolderSection } from "./-files/folder";
import { RootFilesSection } from "./-files/root-files-section";

const FilesPage = () => {
  const filesResult = useAtomValue(filesAtom);
  const activeUploads = useAtomValue(activeUploadsAtom);
  const pendingRootUploads = activeUploads.filter((u) => u.folderId === null);
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

          {folders.map((folder) => (
            <FolderSection key={folder.id} folder={folder} />
          ))}
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

export const Route = createFileRoute("/files/")({
  component: FilesPage,
});
