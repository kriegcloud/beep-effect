"use client";
import { BS } from "@beep/schema";
import { selectedFilesAtom, toggleFileSelectionAtom } from "@beep/shared-client/atom";
import type { File } from "@beep/shared-domain/entities";
import { cn } from "@beep/ui-core/utils";
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import { CheckCircle2Icon, DownloadIcon } from "lucide-react";
import type React from "react";

type FileItemProps = {
  readonly file: File.Model;
};

export const FileItem: React.FC<FileItemProps> = ({ file }) => {
  const selection = useAtomValue(selectedFilesAtom);
  const toggleSelection = useAtomSet(toggleFileSelectionAtom);

  const isSelected = A.contains(selection.fileIds, file.id);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.target = "_blank";
    link.click();
  };

  return (
    <label
      className={cn(
        "flex w-full items-center justify-between rounded-lg border p-4 shadow-sm transition text-left cursor-pointer",
        isSelected
          ? "border-primary border-2 bg-primary/10"
          : "border-border bg-card hover:border-primary/40 hover:shadow-md"
      )}
    >
      <input type="checkbox" checked={isSelected} onChange={() => toggleSelection(file.id)} className="sr-only" />

      <div className="flex items-center gap-3">
        <div className="relative rounded-md overflow-hidden shrink-0">
          <img src={file.url} alt={file.name} className="size-12 object-cover" />
          {isSelected ? (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] bg-black/40">
              <CheckCircle2Icon className="size-6 text-white drop-shadow-lg" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{file.name}</span>
          <span className="text-xs text-muted-foreground truncate">
            {BS.formatSize(file.size)} • {file.mimeType}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {DateTime.formatLocal(file.updatedAt, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="p-2 rounded-md hover:bg-primary/10 transition text-muted-foreground cursor-pointer"
        >
          <DownloadIcon className="size-4" />
        </button>
      </div>
    </label>
  );
};
