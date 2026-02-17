import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  type ActiveUpload,
  cancelUploadAtom,
  ImageTooLargeAfterCompression,
  uploadAtom,
} from "@/routes/files/-files/files-atoms";
import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import * as Option from "effect/Option";
import { AlertCircleIcon, Loader2Icon, XIcon } from "lucide-react";
import React from "react";

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value = value / 1024;
    unitIndex++;
  }

  const formatted = value >= 10 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted} ${units[unitIndex]}`;
};

type PendingFileItemProps = {
  readonly upload: ActiveUpload;
};

export const PendingFileItem: React.FC<PendingFileItemProps> = ({ upload }) => {
  const result = useAtomValue(uploadAtom(upload.id));
  const cancel = useAtomSet(cancelUploadAtom);

  const phase = Option.getOrNull(Result.value(result));
  const isError = Result.isFailure(result) && !Result.isInterrupted(result);

  const errorMessage = Result.error(result).pipe(
    Option.filter((error): error is ImageTooLargeAfterCompression =>
      error instanceof ImageTooLargeAfterCompression,
    ),
    Option.map((error) => `Image too large (${formatFileSize(error.compressedSizeBytes)} after compression)`),
    Option.getOrElse(() => "Upload failed"),
  );

  const statusLabel =
    phase?._tag === "Compressing"
      ? "Compressing..."
      : phase?._tag === "Uploading"
        ? "Uploading..."
        : phase?._tag === "Syncing"
          ? "Syncing..."
          : phase?._tag === "Done"
            ? "Done"
            : isError
              ? errorMessage
              : "Starting...";

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between rounded-lg border p-4 shadow-sm",
        "border-border bg-card",
        isError && "border-destructive",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative rounded-md overflow-hidden shrink-0 size-12 bg-muted flex items-center justify-center">
          {isError ? (
            <AlertCircleIcon className="size-5 text-destructive" />
          ) : (
            <Loader2Icon className="size-5 text-muted-foreground animate-spin" />
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{upload.fileName}</span>
          <span className="text-xs text-muted-foreground truncate">
            {formatFileSize(upload.fileSize)} • {upload.mimeType}
          </span>
          <span
            className={cn(
              "text-xs truncate",
              isError ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {(phase?._tag === "Compressing" || phase?._tag === "Uploading") && (
        <Button variant="ghost" size="icon" className="size-8" onClick={() => cancel(upload.id)}>
          <XIcon className="size-4" />
        </Button>
      )}
    </div>
  );
};
