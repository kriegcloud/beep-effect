import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/cn";
import {
  activeUploadsAtom,
  selectedFilesAtom,
  startUploadAtom,
  toggleFolderSelectionAtom,
} from "@/routes/files/-files/files-atoms";
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { type Folder } from "@example/domain/api/files/files-rpc";
import * as Arr from "effect/Array";
import * as DateTime from "effect/DateTime";
import { ChevronRight, FolderIcon, Upload } from "lucide-react";
import React from "react";
import { FileItem, PendingFileItem } from "../file-item";

type FolderProps = {
  readonly folder: Folder.WithUploadedFiles;
};

const formatFileCount = (count: number): string => {
  if (count === 1) {
    return "1 file";
  }
  return `${count} files`;
};

export const FolderSection: React.FC<FolderProps> = ({ folder }) => {
  const activeUploads = useAtomValue(activeUploadsAtom);
  const folderUploads = activeUploads.filter((u) => u.folderId === folder.id);
  const totalFileCount = folder.files.length + folderUploads.length;
  const hasFiles = totalFileCount > 0;

  const selection = useAtomValue(selectedFilesAtom);
  const toggleSelection = useAtomSet(toggleFolderSelectionAtom);
  const startUpload = useAtomSet(startUploadAtom);
  const isSelected = Arr.contains(selection.folderIds, folder.id);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const fileIds = folder.files.map((file) => file.id);

  const handleCheckboxChange = () => {
    toggleSelection({ folderId: folder.id, fileIdsInFolder: fileIds });
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    startUpload({ _tag: "Folder", id: folder.id });
  };

  return (
    <section
      className={cn(
        "space-y-4 rounded-lg border-2 border-dashed p-4",
        isSelected ? "border-primary bg-primary/5" : "border-muted-foreground/20",
      )}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          className="cursor-pointer"
        />

        <button
          type="button"
          onClick={handleToggleExpand}
          className="flex flex-1 items-center justify-between text-left cursor-pointer hover:opacity-80 transition"
        >
          <div className="flex items-center gap-3">
            <ChevronRight
              className={cn(
                "size-5 text-muted-foreground transition-transform",
                isExpanded && "rotate-90",
              )}
            />

            <div
              className={cn(
                "rounded-md p-2",
                isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
              )}
            >
              <FolderIcon className="size-5" />
            </div>

            <div className="flex flex-col">
              <h3 className="text-base font-semibold">{folder.name}</h3>
              <span className="text-xs text-muted-foreground">
                {formatFileCount(totalFileCount)}
              </span>
            </div>
          </div>

          <span className="text-xs text-muted-foreground">
            Updated{" "}
            {DateTime.formatLocal(folder.updatedAt, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleUpload}
          className="h-8 px-2 text-muted-foreground hover:text-foreground active:text-foreground"
          title="Upload file to folder"
        >
          <Upload className="size-4" />
        </Button>
      </div>

      {isExpanded && (
        <>
          {hasFiles ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {folderUploads.map((upload) => (
                <PendingFileItem key={upload.id} upload={upload} />
              ))}
              {folder.files.map((file) => (
                <FileItem key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              No files in this folder yet.
            </div>
          )}
        </>
      )}
    </section>
  );
};
