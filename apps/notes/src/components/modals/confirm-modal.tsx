"use client";

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@beep/notes/components/ui/alert-dialog";
import { Icons } from "@beep/notes/components/ui/icons";
import type * as React from "react";

export function ConfirmModal({
  count,
  name,
  onConfirm: onConfirmProp,
  ...props
}: {
  name: string;
  onConfirm: () => void;
  count?: number;
} & React.ComponentProps<typeof AlertDialogContent>) {
  const onConfirm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    onConfirmProp();
  };

  return (
    <AlertDialogContent {...props}>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your <span className="font-medium">{count}</span>
          {count === 1 ? ` ${name}` : ` ${name}s`} from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex-row items-center justify-end">
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onConfirm}>
          <Icons.trash />
          <span>Delete</span>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
