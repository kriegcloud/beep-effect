"use client";

import { pushModal } from "@beep/notes/components/modals";
import { routes, useDocumentId } from "@beep/notes/lib/navigation/routes";
import { Button } from "@beep/notes/registry/ui/button";
import { api, useTRPC } from "@beep/notes/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const DocumentBanner = () => {
  const documentId = useDocumentId();
  const router = useRouter();
  const trpc = useTRPC();

  const deleteDocument = api.document.delete.useMutation({
    onSuccess: () => {
      void trpc.document.documents.invalidate();
      void trpc.document.document.invalidate({ id: documentId });
      router.push(routes.home());
    },
  });

  const restoreDocument = api.document.restore.useMutation({
    onSuccess: () => {
      void trpc.document.documents.invalidate();
      void trpc.document.document.invalidate({ id: documentId });
    },
  });

  const onRemove = () => {
    const promise = deleteDocument.mutateAsync({ id: documentId });

    toast.promise(promise, {
      error: "Failed to remove Note!",
      loading: "Deleting Note...",
      success: "Note deleted.",
    });
  };

  const onRestore = () => {
    const promise = restoreDocument.mutateAsync({ id: documentId });

    toast.promise(promise, {
      error: "Failed to restore Note!",
      loading: "Restoring Note...",
      success: "Note Restored.",
    });
  };

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-4 bg-destructive px-3 py-2 text-center text-sm text-destructive-foreground">
      <p>This page is in the Trash</p>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primaryOutline" onClick={onRestore}>
          Restore page
        </Button>

        <Button
          variant="primaryOutline"
          onClick={() => {
            pushModal("Confirm", {
              name: "page",
              onConfirm: onRemove,
            });
          }}
        >
          Delete from Trash
        </Button>
      </div>
    </div>
  );
};
