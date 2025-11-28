"use client";

import { useCurrentUser } from "@beep/notes/components/auth/useCurrentUser";
import { SearchStore, useSearchValue } from "@beep/notes/components/search/SearchStore";
import { Icons } from "@beep/notes/components/ui/icons";
import { routes } from "@beep/notes/lib/navigation/routes";
import { cn } from "@beep/notes/lib/utils";
import { useDebounce } from "@beep/notes/registry/hooks/use-debounce";
import { useMounted } from "@beep/notes/registry/hooks/use-mounted";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@beep/notes/registry/ui/command";
import { useTRPC } from "@beep/notes/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const SearchCommand = () => {
  const user = useCurrentUser();
  const router = useRouter();

  const searchRaw = useSearchValue("search");

  const search = useDebounce(searchRaw, 300);

  const { data } = useQuery({
    ...useTRPC().document.documents.queryOptions({ search }),
    enabled: !!user.id,
  });

  const mounted = useMounted();

  const isOpen = useSearchValue("isOpen");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        if ((e.target as HTMLDivElement).dataset?.slateEditor) {
          return;
        }

        e.preventDefault();
        SearchStore.actions.toggle();
      }
    };
    document.addEventListener("keydown", down);

    return () => document.removeEventListener("keydown", down);
  }, []);

  const onSelect = (id: string) => {
    router.push(routes.document({ documentId: id }));
    SearchStore.actions.onClose();
  };

  if (!mounted) return null;

  return (
    <CommandDialog
      className={cn("[&_[cmdk-input-wrapper]]:mt-0 [&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:py-0")}
      open={isOpen}
      onOpenChange={(value) => {
        SearchStore.set("isOpen", value);
      }}
    >
      <CommandInput
        variant="search"
        value={searchRaw}
        onValueChange={(value) => SearchStore.actions.setSearch(value)}
        placeholder="Search a document..."
      />

      <CommandList className="h-[520px] max-h-none">
        <CommandEmpty className="font-medium text-muted-foreground">No results</CommandEmpty>
        {/* <CommandGroup heading="Actions">
          <CommandItem
            className="mt-1 cursor-pointer"
            onSelect={() => setIsChat(true)}
            title="Ask Ai in current document"
          >
            <Icons.ai className="mr-2" />
            <span>Ask AI in current document</span>
          </CommandItem>
        </CommandGroup> */}
        <CommandGroup heading={`${data?.documents.length ? "Documents" : ""}`}>
          {data?.documents.map((document) => (
            <CommandItem
              key={document.id}
              className="mt-1 cursor-pointer"
              value={`${document.title}`}
              onSelect={() => onSelect(document.id)}
              title={document.title || "Untitled"}
            >
              {document.icon ? <p className="mr-2 text-[18px]">{document.icon}</p> : <Icons.file className="mr-2" />}
              <span>{document.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
