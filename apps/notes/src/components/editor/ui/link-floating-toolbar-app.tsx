"use client";

import { useSession } from "@beep/notes/components/auth/useSession";
import { Skeleton } from "@beep/notes/components/ui/skeleton";
import type { MyLinkElement } from "@beep/notes/registry/components/editor/plate-types";
import { linkPlugin, useActiveLink } from "@beep/notes/registry/components/editor/plugins/link-kit";
import { useDebounce } from "@beep/notes/registry/hooks/use-debounce";
import { Button } from "@beep/notes/registry/ui/button";
import { Command, CommandInput, CommandItem, CommandList } from "@beep/notes/registry/ui/command";
import { getCursorOverlayElement } from "@beep/notes/registry/ui/cursor-overlay";
import { Input, inputVariants } from "@beep/notes/registry/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@beep/notes/registry/ui/popover";
import { useTRPC } from "@beep/notes/trpc/react";
import type { UnsafeTypes } from "@beep/types";
import { unwrapLink, upsertLink, validateUrl } from "@platejs/link";
import { CursorOverlayPlugin } from "@platejs/selection/react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@udecode/cn";
import { FileTextIcon, LinkIcon, Trash2Icon } from "lucide-react";
import { NodeApi, type TText } from "platejs";
import { type PlateEditor, useEditorPlugin, useEditorRef, useEditorSelector, usePluginOption } from "platejs/react";
import * as React from "react";

import { templateList } from "../utils/useTemplateDocument";

const onUpsertLink = (editor: PlateEditor, url: string) => {
  upsertLink(editor, { skipValidation: true, url });
  editor.setOption(linkPlugin, "mode", null);
  editor.tf.focus();
};

export function LinkFloatingToolbar() {
  const mode = usePluginOption(linkPlugin, "mode");

  const anchorElement = usePluginOption(linkPlugin, "anchorElement");
  const { editor, setOption } = useEditorPlugin(linkPlugin);

  const aboveLink = useEditorSelector((editor) => {
    if (editor.api.isExpanded()) return;

    return editor.api.above<MyLinkElement>({
      match: (n) => n.type === linkPlugin.key,
    })?.[0];
  }, []);

  const aboveUrl = editor.api.above<MyLinkElement>()?.[0].url ?? "";

  const [initialUrl, setInitialUrl] = React.useState(aboveUrl);

  React.useEffect(() => {
    setInitialUrl(aboveUrl);
  }, [aboveUrl]);

  const open = mode === "insert" || mode === "edit" || mode === "cursor";

  React.useEffect(() => {
    if (aboveLink) {
      setTimeout(() => {
        setOption("activeId", aboveLink.id);
        setOption("mode", "cursor");
        setOption("anchorElement", editor.api.toDOMNode(aboveLink)!);
      }, 0);

      return;
    }
    if (mode === "cursor" && !aboveLink) {
      setOption("activeId", null);
      setOption("mode", null);
      setOption("anchorElement", null);
    }
  }, [aboveLink]);

  if (!open) return null;

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOption("mode", isOpen ? "insert" : null);
      }}
      modal={false}
    >
      <PopoverAnchor
        virtualRef={{
          current: anchorElement!,
        }}
      />

      <PopoverContent
        onEscapeKeyDown={() => editor.tf.focus()}
        onOpenAutoFocus={(e) => {
          if (mode === "cursor") return e.preventDefault();
        }}
        align="center"
        side="bottom"
      >
        {mode === "insert" ? (
          <InsertLinkCommand initialUrl={initialUrl} />
        ) : (
          <EditLinkCommand autoFocus={mode !== "cursor"} initialUrl={initialUrl} setInitialUrl={setInitialUrl} />
        )}
      </PopoverContent>
    </Popover>
  );
}

const InsertLinkCommand = ({ initialUrl }: { initialUrl: string }) => {
  const [query, setQuery] = React.useState(initialUrl);

  const [searchDocuments, setSearchDocuments] = React.useState<UnsafeTypes.UnsafeAny[]>([]);

  const { editor } = useEditorPlugin(linkPlugin);

  const session = useSession();
  const trpc = useTRPC();

  const { data, isLoading } = useQuery({
    ...trpc.document.documents.queryOptions({ limit: 5 }),
    enabled: !!session,
  });

  const debouncedQuery = useDebounce(query, 300);

  const { data: searchData } = useQuery({
    ...trpc.document.documents.queryOptions({ search: debouncedQuery }),
    enabled: !!session && debouncedQuery.length > 0,
  });

  const recentDocuments = React.useMemo(() => {
    if (!session) return templateList.slice(0, 5);

    const documents = data?.documents ?? [];

    return documents;
  }, [data?.documents, session]);

  React.useEffect(() => {
    if (session) {
      if (!searchData?.documents) return;

      setSearchDocuments(searchData.documents);
    } else {
      setSearchDocuments(templateList.filter((doc) => doc.title?.toLowerCase().includes(query.toLowerCase())));
    }
  }, [searchData?.documents, session, query]);

  const count = searchDocuments.length;

  return (
    <Command shouldFilter={false}>
      <CommandInput
        value={query}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) return onUpsertLink(editor, query);
        }}
        onValueChange={(value) => setQuery(value)}
        placeholder="Paste link or search pages"
      />
      <React.Fragment>
        {count > 1 && <span className="mx-2 text-sm font-medium text-gray-500">Recents</span>}
        <CommandList>
          {isLoading ? (
            <div className="flex flex-col gap-2 p-2">
              <Skeleton className="h-[26px]" />
              <Skeleton className="h-[26px]" />
              <Skeleton className="h-[26px]" />
              <Skeleton className="h-[26px]" />
            </div>
          ) : (
            <React.Fragment>
              {query.length === 0 &&
                recentDocuments.map((document) => <InternalLinkCommandItem key={document.id} document={document} />)}

              {query.length > 0 && (
                <React.Fragment>
                  {searchDocuments.slice(0, 5).map((document) => (
                    <InternalLinkCommandItem key={document.id} document={document} />
                  ))}

                  <OutsideLinkCommandItem query={query} />
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </CommandList>
      </React.Fragment>
    </Command>
  );
};

const EditLinkCommand = ({
  autoFocus,
  initialUrl,
  setInitialUrl,
}: {
  initialUrl: string;
  setInitialUrl: (url: string) => void;
  autoFocus?: boolean;
}) => {
  const [searching, setSearching] = React.useState(false);
  const [query, setQuery] = React.useState<string>("");
  const [text, setText] = React.useState<string>("");
  const [searchDocuments, setSearchDocuments] = React.useState<UnsafeTypes.UnsafeAny[]>([]);

  const { editor, setOption } = useEditorPlugin(linkPlugin);
  const activeLinkId = usePluginOption(linkPlugin, "activeId");
  const mode = usePluginOption(linkPlugin, "mode");

  const editingLinkEntry = useActiveLink();

  React.useEffect(() => {
    if (editingLinkEntry) {
      setText(NodeApi.string(editingLinkEntry[0]));
    }
  }, [editingLinkEntry]);

  const session = useSession();
  const trpc = useTRPC();

  const { data } = useQuery({
    ...trpc.document.document.queryOptions({ id: initialUrl.slice(1) }),
    enabled: !!session && initialUrl.startsWith("/"),
  });

  const document = session ? data?.document : templateList.find((template) => template.id === initialUrl.slice(1));

  const { data: searchData } = useQuery({
    ...trpc.document.documents.queryOptions({ search: query }),
    enabled: !!session && query.length > 0,
  });

  React.useEffect(() => {
    if (session) {
      if (!searchData?.documents) return;

      setSearchDocuments(searchData.documents);
    } else {
      setSearchDocuments(templateList.filter((doc) => doc.title?.toLowerCase().includes(query.toLowerCase())));
    }
  }, [searchData?.documents, session, query]);

  const onEditLink = (url: string) => {
    upsertLink(editor, {
      skipValidation: true,
      url,
    });

    setInitialUrl(url);
    setQuery("");
    setSearching(false);
    setOption("mode", "cursor");
    setOption("anchorElement", editor.api.toDOMNode(editingLinkEntry![0])!);
    editor.tf.focus();
  };

  const updateLinkSelection = () => {
    editor.tf.select(
      editor.api.node({
        at: [],
        mode: "lowest",
        match: (n) => n.type === linkPlugin.key && n.id === activeLinkId,
      })![0]
    );

    setTimeout(() => {
      editor.getApi(CursorOverlayPlugin).cursorOverlay.addCursor("selection", {
        selection: editor.selection,
      });

      setOption("anchorElement", getCursorOverlayElement() as UnsafeTypes.UnsafeAny);
    }, 0);
  };

  const onTitleChange = (newTitle: string) => {
    setText(newTitle);

    if (newTitle.length === 0) return;

    const firstText = editingLinkEntry![0].children[0];

    const newLink = { ...firstText, text: newTitle };

    editor.tf.replaceNodes<TText>(newLink, {
      at: editingLinkEntry![1],
      children: true,
    });

    updateLinkSelection();
  };

  return (
    <React.Fragment>
      <div className="mt-2 px-3 text-xs font-medium text-muted-foreground">Page or URL</div>

      {searching ? (
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) return onEditLink(query);
            }}
            onValueChange={(value) => setQuery(value)}
            placeholder="Paste link or search pages"
            wrapClassName="mt-0"
            autoFocus
          />
          {query.length > 0 && (
            <CommandList>
              {searchDocuments.slice(0, 5).map((document) => (
                <InternalLinkCommandItem
                  key={document.id}
                  onSelect={() => onEditLink(`/${document.id}`)}
                  document={document}
                />
              ))}

              <OutsideLinkCommandItem query={query} />
            </CommandList>
          )}
        </Command>
      ) : (
        <div className="px-3 py-1.5">
          <button
            type="button"
            className={cn(inputVariants(), "flex w-full cursor-pointer items-center hover:bg-muted")}
            onClick={() => {
              setSearching(true);

              const isInternal = initialUrl.startsWith("/");

              if (!isInternal) {
                setQuery(initialUrl);
              }
            }}
          >
            {document ? (
              <React.Fragment>
                {document.icon ? <span className="mr-1">{document.icon}</span> : <FileTextIcon className="size-3.5" />}
                <span>{document.title}</span>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <LinkIcon className="mt-px mr-1 size-3.5 shrink-0" />
                <span className="h-6 max-w-[200px] truncate text-sm leading-6">{initialUrl}</span>
              </React.Fragment>
            )}
          </button>
        </div>
      )}

      {query.length === 0 && (
        <div className="my-2 px-3">
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Link title</div>

          <Input
            value={text}
            onChange={(e) => onTitleChange(e.target.value)}
            onFocus={() => {
              if (mode === "cursor") {
                setOption("mode", "edit");
                updateLinkSelection();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();

                editor.tf.select(editingLinkEntry![0], { focus: true });
                setOption("anchorElement", editor.api.toDOMNode(editingLinkEntry![0])!);
                setOption("mode", "cursor");
              }
            }}
            autoFocus={!searching && autoFocus}
          />

          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => {
              unwrapLink(editor);
              setOption("mode", null);
              editor.tf.focus();
            }}
          >
            <Trash2Icon />
            Remove link
          </Button>
        </div>
      )}
    </React.Fragment>
  );
};

const OutsideLinkCommandItem = ({ query }: { query: string }) => {
  const editor = useEditorRef();

  return (
    <CommandItem className="h-fit py-1" onSelect={() => onUpsertLink(editor, query)}>
      <LinkIcon className="mr-2 size-3.5 shrink-0" />
      <div className="flex flex-col">
        <span className="truncate text-sm font-medium">{query}</span>
        <span className="text-xs text-gray-500">
          {validateUrl(editor, query) ? "Link to web page" : "Type a complete URL to link"}
        </span>
      </div>
    </CommandItem>
  );
};

const InternalLinkCommandItem = ({
  document,
  onSelect,
}: {
  document: UnsafeTypes.UnsafeAny;
  onSelect?: undefined | (() => void);
}) => {
  const editor = useEditorRef();

  return (
    <CommandItem
      className="flex items-center gap-2"
      onSelect={() => {
        if (onSelect) return onSelect();

        onUpsertLink(editor, `/${document.id}`);
      }}
      autoFocus
    >
      {document.icon ? <span>{document.icon}</span> : <FileTextIcon className="size-3.5" />}
      <span>{document.title}</span>
    </CommandItem>
  );
};
