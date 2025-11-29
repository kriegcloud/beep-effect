"use client";

import { pushModal } from "@beep/notes/components/modals";
import { Icons } from "@beep/notes/components/ui/icons";
import { routes, useDocumentId } from "@beep/notes/lib/navigation/routes";
import { useDebounce } from "@beep/notes/registry/hooks/use-debounce";
import { Button } from "@beep/notes/registry/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@beep/notes/registry/ui/command";
import { api, useTRPC } from "@beep/notes/trpc/react";
import type { UnsafeTypes } from "@beep/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { removeExpandedIdFromStorage } from "./document-list";

export function TrashBox() {
  const router = useRouter();
  const documentId = useDocumentId();
  const trpc = useTRPC();

  const [search, setSearch] = useState("");
  const q = useDebounce(search, 500);

  const { data, isLoading } = useQuery({
    ...trpc.document.trash.queryOptions({ q }),
    placeholderData: keepPreviousData,
  });

  const deleteDocument = api.document.delete.useMutation({
    onSuccess: (_, input) => {
      void trpc.document.documents.invalidate();
      void trpc.document.trash.invalidate({ q });
      removeExpandedIdFromStorage(input.id);
    },
  });

  const restoreDocument = api.document.restore.useMutation({
    onSuccess: () => {
      void trpc.document.documents.invalidate();
      void trpc.document.document.invalidate({ id: documentId });
      void trpc.document.trash.invalidate({ q });
    },
  });

  const filteredDocuments = data?.documents?.filter((document) => {
    return document.title?.toLowerCase().includes(search.toLowerCase());
  });

  const onClick = (documentId: string) => {
    router.push(routes.document({ documentId }));
  };

  const onRestore = (documentId: string) => {
    const promise = restoreDocument.mutateAsync({ id: documentId });

    toast.promise(promise, {
      error: "Failed to restore note!",
      loading: "Restoring note...",
      success: "Note Restored.",
    });
  };

  const onRemove = (document: UnsafeTypes.UnsafeAny) => {
    const promise = deleteDocument.mutateAsync({ id: document.id });

    toast.promise(promise, {
      error: "Failed to delete note!",
      loading: "Deleting note...",
      success: "Note Deleted.",
    });

    if (documentId === document.id) {
      router.push(routes.home());
    }
  };

  return (
    <Command shouldFilter={false}>
      <div className="flex items-center gap-x-1 p-2">
        <CommandInput className="" value={search} onValueChange={setSearch} placeholder="Search trash..." />
      </div>

      <CommandList className="">
        <CommandEmpty className="my-auto flex h-[300px] flex-col items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <Icons.trash className="mb-2 size-8 text-muted-foreground/70" />
              <div className="text-sm text-muted-foreground">Trash pages</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Icons.search className="mb-2 size-8 text-muted-foreground/70" />
              <div className="text-sm font-semibold text-muted-foreground">No matches</div>
            </div>
          )}
        </CommandEmpty>
        <CommandGroup className="h-[300px]">
          {filteredDocuments?.map((document) => (
            <CommandItem
              key={document.id}
              variant="menuItem"
              className="justify-between"
              onSelect={() => onClick(document.id)}
            >
              <div className="flex items-center gap-2">
                {document.icon ?? <Icons.document />}

                <div>{document.title}</div>
              </div>
              <div className="flex items-center">
                <Button
                  size="menuAction"
                  variant="menuAction"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(document.id);
                  }}
                >
                  <Icons.undo />
                </Button>
                <Button
                  size="menuAction"
                  variant="menuAction"
                  onClick={(e) => {
                    e.stopPropagation();
                    pushModal("Confirm", {
                      name: "document",
                      onConfirm: () => onRemove(document),
                    });
                  }}
                >
                  <Icons.trash />
                </Button>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
