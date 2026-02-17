import { activeUploadsAtom } from "@/routes/files/-files/files-atoms";
import { useAtomValue } from "@effect-atom/atom-react";
import { UploadedFile } from "@example/domain/api/files/files-rpc";
import { FilesIcon } from "lucide-react";
import { FileItem, PendingFileItem } from "../file-item";

type RootFilesSectionProps = {
  readonly files: ReadonlyArray<UploadedFile>;
};

export const RootFilesSection: React.FC<RootFilesSectionProps> = ({ files }) => {
  const activeUploads = useAtomValue(activeUploadsAtom);
  const rootUploads = activeUploads.filter((u) => u.folderId === null);
  const totalCount = files.length + rootUploads.length;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <FilesIcon className="size-5" />
        </div>

        <div className="flex flex-col">
          <h2 className="text-base font-semibold">Files without Folder</h2>
          <span className="text-xs text-muted-foreground">
            {totalCount === 1 ? "1 file" : `${totalCount} files`}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rootUploads.map((upload) => (
          <PendingFileItem key={upload.id} upload={upload} />
        ))}
        {files.map((file) => (
          <FileItem key={file.id} file={file} />
        ))}
      </div>
    </section>
  );
};
