"use client";

import { cn } from "@beep/notes/lib/utils";
import { Button } from "@beep/notes/registry/ui/button";
import { Spinner } from "@beep/notes/registry/ui/spinner";
import type React from "react";
import { type DropzoneOptions, useDropzone } from "react-dropzone";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Card, CardContent } from "./card";
import { Icons } from "./icons";

export function FileCard({
  children,
  className,
  loading,
  name = "Untitled",
  onRemove,
  ...props
}: React.ComponentProps<"div"> & {
  name: string;
  onRemove: () => void;
  loading?: boolean;
}) {
  return (
    <div className="group relative inline-block text-sm">
      <div className={cn("overflow-hidden rounded-xl border bg-card", className)} {...props}>
        <div className="max-w-60 p-2">
          <div className="flex flex-row items-center gap-2">
            <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
              {loading ? <Spinner className="size-5" /> : <Icons.dropzone className="size-5" />}
            </div>

            <div className="overflow-hidden">
              <div className="truncate font-semibold" title={name}>
                {name}
              </div>

              <div className="truncate text-muted-foreground">{children}</div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="absolute top-1 right-1 translate-x-1/2 -translate-y-1/2 bg-popover p-1 group-hover:opacity-100 hover:opacity-100 md:opacity-0"
            label="Close"
            icon={<Icons.x />}
          />
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>

            <AlertDialogDescription>You are about to delete the file "{name}".</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction variant="destructive" onClick={onRemove}>
              <Icons.trash className="mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// https://github.com/shadcn-ui/ui/issues/163#issuecomment-1871434185
export function Dropzone({
  className,
  classNameContent,
  dragActiveMessage,
  message,
  onDrop,
  ...props
}: React.ComponentProps<"div"> & {
  message: string;
  onDrop: DropzoneOptions["onDrop"];
  classNameContent?: string;
  dragActiveMessage?: string;
}) {
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      "application/json": [".json"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/csv": [".csv"],
      "text/markdown": [".md"],
      "text/plain": [".txt"],
    },
    multiple: true,
    onDrop: onDrop,
  });

  return (
    <Card
      className={cn(
        "relative size-full border-2 border-dashed bg-muted hover:cursor-pointer hover:border-muted-foreground/50",
        isDragActive && "border-muted-foreground/50 bg-accent",
        className
      )}
      {...props}
    >
      <CardContent
        {...getRootProps({
          className: cn("h-full p-0 text-sm", "dropzone", classNameContent),
        })}
      >
        <div className="size-full text-muted-foreground">
          <input {...getInputProps()} className="size-full" />

          <div className="flex size-full flex-col items-center justify-center gap-2 font-semibold">
            <Icons.upload className="size-5" />

            {isDragActive ? (dragActiveMessage ?? message) : message}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
