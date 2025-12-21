"use client";
import { BS } from "@beep/schema";
import {
  type ActiveUpload,
  cancelUploadAtom,
  ImageTooLargeAfterCompression,
  uploadAtom,
} from "@beep/shared-client/atom";
import { cn } from "@beep/ui-core/utils";
import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import IconButton from "@mui/material/IconButton";
import * as O from "effect/Option";
import { AlertCircleIcon, Loader2Icon, XIcon } from "lucide-react";
import type React from "react";

type PendingFileItemProps = {
  readonly upload: ActiveUpload;
};

export const PendingFileItem: React.FC<PendingFileItemProps> = ({ upload }) => {
  const result = useAtomValue(uploadAtom(upload.id));
  const cancel = useAtomSet(cancelUploadAtom);

  const phase = O.getOrNull(Result.value(result));
  const isError = Result.isFailure(result) && !Result.isInterrupted(result);

  const errorMessage = Result.error(result).pipe(
    O.filter((error): error is ImageTooLargeAfterCompression => error instanceof ImageTooLargeAfterCompression),
    O.map((error) => `Image too large (${BS.formatSize(error.compressedSizeBytes)} after compression)`),
    O.getOrElse(() => "Upload failed")
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
        isError && "border-destructive"
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
            {BS.formatSize(upload.fileSize)} • {upload.mimeType}
          </span>
          <span className={cn("text-xs truncate", isError ? "text-destructive" : "text-muted-foreground")}>
            {statusLabel}
          </span>
        </div>
      </div>

      {(phase?._tag === "Compressing" || phase?._tag === "Uploading") && (
        <IconButton className="size-8" onClick={() => cancel(upload.id)}>
          <XIcon className="size-4" />
        </IconButton>
      )}
    </div>
  );
};
