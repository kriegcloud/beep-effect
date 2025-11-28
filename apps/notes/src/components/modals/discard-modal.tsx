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

export function DiscardModal({
  onCancel: onCancelProp,
  onConfirm: onConfirmProp,
  onSettled: onSettledProp,
  ...props
}: {
  onConfirm: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onCancel?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onSettled?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
} & React.ComponentProps<typeof AlertDialogContent>) {
  const onConfirm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    onConfirmProp(e);
    onSettledProp?.(e);
  };

  const onCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    onCancelProp?.(e);
    onSettledProp?.(e);
  };

  return (
    <AlertDialogContent {...props}>
      <AlertDialogHeader>
        <AlertDialogTitle>Do you want to discard the content?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. Are you sure you want to discard your this content? Your current progress will
          be lost.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onConfirm}>
          <Icons.trash />
          <span>Discard</span>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
