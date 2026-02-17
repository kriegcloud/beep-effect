import { cn } from "@/lib/cn";
import {
  selectedFilesAtom,
  toggleFileSelectionAtom,
} from "@/routes/files/-files/files-atoms";
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { UploadedFile } from "@example/domain/api/files/files-rpc";
import * as Arr from "effect/Array";
import * as DateTime from "effect/DateTime";
import { CheckCircle2Icon, DownloadIcon } from "lucide-react";
import React from "react";

const formatFileSize = (sizeStr: string): string => {
  const bytes = BigInt(sizeStr);
  if (bytes === 0n) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024n && unitIndex < units.length - 1) {
    value = value / 1024n;
    unitIndex++;
  }

  const remainder = bytes % 1024n ** BigInt(unitIndex);
  const decimal = unitIndex > 0 ? Number(remainder) / Number(1024n ** BigInt(unitIndex)) : 0;
  const total = Number(value) + decimal;

  const formatted = total >= 10 ? total.toFixed(0) : total.toFixed(1);
  return `${formatted} ${units[unitIndex]}`;
};

type FileItemProps = {
  readonly file: UploadedFile;
};

export const FileItem: React.FC<FileItemProps> = ({ file }) => {
  const selection = useAtomValue(selectedFilesAtom);
  const toggleSelection = useAtomSet(toggleFileSelectionAtom);
  const isSelected = Arr.contains(selection.fileIds, file.id);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = file.uploadthingUrl;
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
          : "border-border bg-card hover:border-primary/40 hover:shadow-md",
      )}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => toggleSelection(file.id)}
        className="sr-only"
      />

      <div className="flex items-center gap-3">
        <div className="relative rounded-md overflow-hidden shrink-0">
          <img src={file.uploadthingUrl} alt={file.name} className="size-12 object-cover" />
          {isSelected ? (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] bg-black/40">
              <CheckCircle2Icon className="size-6 text-white drop-shadow-lg" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{file.name}</span>
          <span className="text-xs text-muted-foreground truncate">
            {formatFileSize(file.size)} • {file.mimeType}
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
