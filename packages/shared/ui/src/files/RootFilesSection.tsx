"use client";
import { activeUploadsAtom } from "@beep/shared-client/atom";
import type { File } from "@beep/shared-domain/entities";
import { useAtomValue } from "@effect-atom/atom-react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { FilesIcon } from "lucide-react";
import { FileItem, PendingFileItem } from "./file-item";

type RootFilesSectionProps = {
  readonly files: ReadonlyArray<File.Model>;
};

export const RootFilesSection: React.FC<RootFilesSectionProps> = ({ files }) => {
  const activeUploads = useAtomValue(activeUploadsAtom);
  const rootUploads = F.pipe(
    activeUploads,
    A.filter((u) => u.folderId === null)
  );
  const totalCount = files.length + rootUploads.length;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <FilesIcon className="size-5" />
        </div>

        <div className="flex flex-col">
          <h2 className="text-base font-semibold">Files without Folder</h2>
          <span className="text-xs text-muted-foreground">{totalCount === 1 ? "1 file" : `${totalCount} files`}</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {F.pipe(
          rootUploads,
          A.map((upload) => <PendingFileItem key={upload.id} upload={upload} />)
        )}
        {F.pipe(
          files,
          A.map((file) => <FileItem key={file.id} file={file} />)
        )}
      </div>
    </section>
  );
};
