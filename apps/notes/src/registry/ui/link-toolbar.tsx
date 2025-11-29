"use client";

import type { MyLinkElement } from "@beep/notes/registry/components/editor/plate-types";
import { linkPlugin, useActiveLink } from "@beep/notes/registry/components/editor/plugins/link-kit";

import { unwrapLink, upsertLink, validateUrl } from "@platejs/link";
import { CursorOverlayPlugin } from "@platejs/selection/react";
import { cn } from "@udecode/cn";
import { FileTextIcon, LinkIcon, Trash2Icon } from "lucide-react";
import { NodeApi, type TText } from "platejs";
import { type PlateEditor, useEditorPlugin, useEditorRef, useEditorSelector, usePluginOption } from "platejs/react";
import * as React from "react";

import { Button } from "./button";
import { Command, CommandInput, CommandItem, CommandList } from "./command";
import { getCursorOverlayElement } from "./cursor-overlay";
import { Input, inputVariants } from "./input";
import { mockRecentDocuments } from "./link-node";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";

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

  const [searchDocuments, setSearchDocuments] = React.useState<any[]>([]);

  const { editor } = useEditorPlugin(linkPlugin);

  const recentDocuments = React.useMemo(() => {
    return mockRecentDocuments.slice(0, 5);
  }, []);

  React.useEffect(() => {
    setSearchDocuments(mockRecentDocuments.filter((doc) => doc.title?.toLowerCase().includes(query.toLowerCase())));
  }, [query]);

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
  readonly initialUrl: string;
  readonly setInitialUrl: (url: string) => void;
  readonly autoFocus?: undefined | boolean;
}) => {
  const [searching, setSearching] = React.useState(false);
  const [query, setQuery] = React.useState<string>("");
  const [text, setText] = React.useState<string>("");
  const [searchDocuments, setSearchDocuments] = React.useState<any[]>([]);

  const mode = usePluginOption(linkPlugin, "mode");

  const { editor, setOption } = useEditorPlugin(linkPlugin);
  const activeLinkId = usePluginOption(linkPlugin, "activeId");

  const editingLinkEntry = useActiveLink();

  React.useEffect(() => {
    if (editingLinkEntry) {
      setText(NodeApi.string(editingLinkEntry[0]));
    }
  }, [editingLinkEntry]);

  const document = mockRecentDocuments.find((template) => template.id === initialUrl.slice(1));

  React.useEffect(() => {
    setSearchDocuments(mockRecentDocuments.filter((doc) => doc.title?.toLowerCase().includes(query.toLowerCase())));
  }, [query]);

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

      setOption("anchorElement", getCursorOverlayElement() as any);
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

const InternalLinkCommandItem = ({ document, onSelect }: { document: any; onSelect?: undefined | (() => void) }) => {
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
