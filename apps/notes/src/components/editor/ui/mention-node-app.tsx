"use client";

import { useSession } from "@beep/notes/components/auth/useSession";
import { COVER_GRADIENTS } from "@beep/notes/components/cover/cover-popover";
import { BaseEditorKit } from "@beep/notes/registry/components/editor/editor-base-kit";

import type { MyMentionElement } from "@beep/notes/registry/components/editor/plate-types";
import { insertInlineElement } from "@beep/notes/registry/components/editor/transforms";
import { useDebounce } from "@beep/notes/registry/hooks/use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "@beep/notes/registry/ui/avatar";
import { EditorStatic } from "@beep/notes/registry/ui/editor-static";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@beep/notes/registry/ui/hover-card";
import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from "@beep/notes/registry/ui/inline-combobox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@beep/notes/registry/ui/tooltip";
import type { RouterDocumentItem, RouterUserItem } from "@beep/notes/server/api/types";
import { useTRPC } from "@beep/notes/trpc/react";
import { DatePlugin } from "@platejs/date/react";
import { MentionPlugin } from "@platejs/mention/react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@udecode/cn";
import { ArrowUpRightIcon, EllipsisIcon, FileTextIcon } from "lucide-react";
import Image from "next/image";
import { IS_APPLE, type Value } from "platejs";
import {
  PlateElement,
  type PlateElementProps,
  useEditorRef,
  useFocused,
  useHotkeys,
  usePlateEditor,
  useReadOnly,
  useSelected,
} from "platejs/react";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useMounted } from "react-tweet";

export function MentionInputElement(props: PlateElementProps) {
  const [placeholder, setPlaceholder] = useState("Mention a person,page,or date...");

  const { children, editor, element } = props;
  const [search, setSearch] = useState("");

  return (
    <PlateElement
      {...props}
      as="span"
      attributes={{
        ...props.attributes,
        "data-slate-value": element.value,
      }}
    >
      <InlineCombobox value={search} element={element} setValue={setSearch} showTrigger={false} trigger="@">
        <span className="rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm ring-ring">
          <span className="font-bold">@</span>
          <InlineComboboxInput className="min-w-[100px]" placeholder={placeholder} />
        </span>

        <InlineComboboxContent variant="mention">
          <InlineComboboxEmpty>No results found</InlineComboboxEmpty>

          <InlineComboboxGroup>
            <InlineComboboxGroupLabel>Date</InlineComboboxGroupLabel>
            <InlineComboboxItem
              value="today"
              onClick={() => {
                insertInlineElement(editor, DatePlugin.key);
              }}
              onFocus={() => setPlaceholder("Today")}
              onMouseEnter={() => setPlaceholder("Today")}
            >
              <span>Today</span>
              <span className="mx-1 text-muted-foreground">—</span>
              <span className="text-xs font-medium text-muted-foreground">
                {new Date().toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </InlineComboboxItem>
          </InlineComboboxGroup>

          <DocumentComboboxGroup
            onDocumentHover={(name) => setPlaceholder(name)}
            onDocumentSelect={(document) => {
              editor.tf.insertNodes<MyMentionElement>({
                key: `/${document.id}`,
                children: [{ text: "" }],
                coverImage: document.coverImage ?? undefined,
                icon: document.icon ?? undefined,
                type: MentionPlugin.key,
                value: document.title!,
              });
              editor.tf.move({ unit: "offset" });
            }}
            search={search}
          />

          <PeopleComboboxGroup
            onUserHover={(name) => setPlaceholder(name)}
            onUserSelect={(user) => {
              editor.tf.insertNodes<MyMentionElement>({
                key: user.id,
                children: [{ text: "" }],
                type: MentionPlugin.key,
                value: user.name ?? user.email!,
              });
              editor.tf.move({ unit: "offset" });
            }}
            search={search}
          />
        </InlineComboboxContent>
      </InlineCombobox>
      {children}
    </PlateElement>
  );
}

interface PeopleComboboxGroupProps {
  search: string;
  onUserHover: (name: string) => void;
  onUserSelect: (user: RouterUserItem) => void;
}

// eslint-disable-next-line perfectionist/sort-modules
function PeopleComboboxGroup({ search: searchRaw, onUserHover, onUserSelect }: PeopleComboboxGroupProps) {
  const [cursor, setCursor] = useState<string | undefined>();
  const [allUsers, setAllUsers] = useState<RouterUserItem[]>([]);
  const firstNewItemRef = useRef<HTMLDivElement>(null);

  const session = useSession();
  const trpc = useTRPC();

  const search = useDebounce(searchRaw, 100);

  const { data: apiData, isLoading } = useQuery({
    ...trpc.user.users.queryOptions({
      cursor,
      limit: 5,
      search: search,
    }),
    enabled: !!session,
  });

  useEffect(() => {
    if (session) {
      if (apiData?.items) {
        if (cursor) {
          setAllUsers((prev) => {
            const newItems = apiData.items.filter((item) => !prev.some((user) => user.id === item.id));

            return [...prev, ...newItems];
          });
        } else {
          setAllUsers(apiData.items);
        }
      }
    } else {
      const filteredUsers = mockUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(search.toLowerCase()) ||
          user.email?.toLowerCase().includes(search.toLowerCase())
      );
      setAllUsers(filteredUsers);
    }
  }, [apiData, cursor, search, session]);

  useEffect(() => {
    if (firstNewItemRef.current) {
      firstNewItemRef.current.focus();
    }
  }, [allUsers]);

  if (allUsers.length === 0) {
    return null;
  }

  return (
    <InlineComboboxGroup>
      <InlineComboboxGroupLabel>People</InlineComboboxGroupLabel>

      {allUsers.map((user, index) => (
        <React.Fragment key={user.id}>
          <InlineComboboxItem
            ref={user.id === cursor ? firstNewItemRef : undefined}
            value={user.name ?? user.email!}
            onClick={() => onUserSelect(user)}
            onFocus={() => onUserHover(user.name ?? user.email!)}
            onMouseEnter={() => onUserHover(user.name ?? user.email!)}
          >
            <Avatar className="mr-2.5 size-5">
              <AvatarImage alt={user.name!} src={user.profileImageUrl!} />
              <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            {user.name ?? user.email}
          </InlineComboboxItem>

          {session && index === allUsers.length - 1 && apiData?.nextCursor && (
            <InlineComboboxItem
              className="text-muted-foreground"
              disabled={isLoading}
              value="load-more"
              onClick={(e) => {
                e.preventDefault();

                if (apiData?.nextCursor) {
                  setCursor(apiData.nextCursor);
                }
              }}
            >
              <EllipsisIcon className="mr-2.5 size-5!" />
              <span>{isLoading ? "Loading..." : "Load more"}</span>
            </InlineComboboxItem>
          )}
        </React.Fragment>
      ))}
    </InlineComboboxGroup>
  );
}

// eslint-disable-next-line perfectionist/sort-modules
interface DocumentComboboxGroupProps {
  search: string;
  onDocumentHover: (title: string) => void;
  onDocumentSelect: (document: RouterDocumentItem) => void;
}

function DocumentComboboxGroup({ search: searchRaw, onDocumentHover, onDocumentSelect }: DocumentComboboxGroupProps) {
  const [cursor, setCursor] = useState<string | undefined>();
  const [allDocuments, setAllDocuments] = useState<RouterDocumentItem[]>([]);
  const firstNewItemRef = useRef<HTMLDivElement>(null);

  const session = useSession();
  const trpc = useTRPC();

  const search = useDebounce(searchRaw, 500);

  const { data: apiData, isLoading } = useQuery({
    ...trpc.document.documents.queryOptions({
      cursor,
      limit: 5,
      search: search,
    }),
    enabled: !!session,
  });

  useEffect(() => {
    if (session) {
      if (apiData?.documents) {
        if (cursor) {
          setAllDocuments((prev) => {
            const newItems = apiData.documents.filter((item) => !prev.some((doc) => doc.id === item.id));

            return [...prev, ...newItems];
          });
        } else {
          setAllDocuments(apiData.documents);
        }
      }
    } else {
      const filteredDocs = mockMentionDocuments.filter((doc) => doc.title.toLowerCase().includes(search.toLowerCase()));
      setAllDocuments(filteredDocs as any);
    }
  }, [apiData, cursor, search, session]);

  useEffect(() => {
    if (firstNewItemRef.current) {
      firstNewItemRef.current.focus();
    }
  }, [allDocuments]);

  if (allDocuments.length === 0) {
    return null;
  }

  return (
    <InlineComboboxGroup>
      <InlineComboboxGroupLabel>Link to page</InlineComboboxGroupLabel>

      {allDocuments.map((document, index) => (
        <React.Fragment key={document.id}>
          <InlineComboboxItem
            ref={document.id === cursor ? firstNewItemRef : undefined}
            value={document.title || "Untitled Document"}
            onClick={() => onDocumentSelect(document)}
            onFocus={() => onDocumentHover(document.title ?? "")}
            onMouseEnter={() => onDocumentHover(document.title ?? "")}
          >
            <span className="mr-2 size-5">{document.icon ?? <FileTextIcon />}</span>
            {document.title ?? "Untitled Document"}
          </InlineComboboxItem>

          {session && index === allDocuments.length - 1 && apiData?.nextCursor && (
            <InlineComboboxItem
              className="text-muted-foreground"
              disabled={isLoading}
              value="load-more"
              onClick={(e) => {
                e.preventDefault();

                if (apiData?.nextCursor) {
                  setCursor(apiData.nextCursor);
                }
              }}
            >
              <EllipsisIcon className="mr-2.5 size-5!" />
              <span>{isLoading ? "Loading..." : "Load more"}</span>
            </InlineComboboxItem>
          )}
        </React.Fragment>
      ))}
    </InlineComboboxGroup>
  );
}

/** Only used for mock data when not logged in */
export const mockMentionDocuments = [
  {
    id: "block-menu",
    contentRich: [
      {
        children: [
          {
            text: "A comprehensive guide to using the block menu in your documents.",
          },
        ],
        type: "p",
      },
    ],
    coverImage: "https://picsum.photos/seed/block-menu/800/400",
    icon: "📋",
    title: "Block Menu",
  },
  {
    id: "floating-toolbar",
    contentRich: [
      {
        children: [
          {
            text: "Learn how to use the floating toolbar for quick formatting.",
          },
        ],
        type: "p",
      },
    ],
    coverImage: "https://picsum.photos/seed/floating-toolbar/800/400",
    icon: "🧰",
    title: "Floating Toolbar",
  },
  {
    id: "media-toolbar",
    contentRich: [
      {
        children: [{ text: "Everything you need to know about the media toolbar." }],
        type: "p",
      },
    ],
    coverImage: "https://picsum.photos/seed/media-toolbar/800/400",
    icon: "🎮",
    title: "Media Toolbar",
  },
  {
    id: "table-of-contents",
    contentRich: [
      {
        children: [
          {
            text: "How to create and manage table of contents in your documents.",
          },
        ],
        type: "p",
      },
    ],
    coverImage: "https://picsum.photos/seed/table-of-contents/800/400",
    icon: "📚",
    title: "Table of Contents",
  },
];

const mockUsers = [
  {
    id: "1",
    email: "john@example.com",
    name: "John Doe",
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: "2",
    email: "jane@example.com",
    name: "Jane Smith",
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  },
  {
    id: "3",
    email: "bob@example.com",
    name: "Bob Wilson",
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  },
  {
    id: "4",
    email: "alice@example.com",
    name: "Alice Brown",
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
  },
  {
    id: "5",
    email: "charlie@example.com",
    name: "Charlie Davis",
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
  },
];

function DocumentMentionElement(
  props: PlateElementProps<MyMentionElement> & {
    prefix?: string;
  }
) {
  const { children } = props;
  const element = props.element;
  const selected = useSelected();
  const focused = useFocused();

  useHotkeys(
    "enter",
    () => {
      if (selected && focused) {
        window.open(element.key!.slice(1), "_self");
      }
    },
    {
      enabled: selected && focused,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    }
  );

  return (
    <TooltipProvider>
      <Tooltip open={selected && focused}>
        <HoverCard closeDelay={0} openDelay={0}>
          <HoverCardTrigger contentEditable={false}>
            <TooltipTrigger contentEditable={false}>
              <PlateElement
                {...props}
                className={cn(
                  "inline-block cursor-pointer rounded px-0.5 hover:bg-muted",
                  selected && focused && "bg-brand/25"
                )}
                attributes={{
                  ...props.attributes,
                  contentEditable: false,
                  "data-slate-value": element.value,
                  draggable: true,
                  onClick: () => {
                    window.open(element.key!.slice(1), "_self");
                  },
                  onMouseDown: (e) => e.preventDefault(),
                }}
              >
                <React.Fragment>
                  {props.prefix}
                  <span className="relative mr-3 inline-block">
                    {element.icon}
                    <ArrowUpRightIcon className="absolute -right-3 bottom-0 size-3.5 font-bold" />
                  </span>
                  <span className="border-b-1 font-medium">{element.value}</span>
                  {children}
                </React.Fragment>
              </PlateElement>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                <span className="mr-1">Open Page</span>
                <kbd>↵</kbd>
              </p>
            </TooltipContent>
          </HoverCardTrigger>
          <HoverCardContent className="relative p-0 pb-4">
            <MentionHoverCardContent element={element} />
          </HoverCardContent>
        </HoverCard>
      </Tooltip>
    </TooltipProvider>
  );
}

function MentionHoverCardContent(props: { element: MyMentionElement }) {
  const editor = useEditorRef();
  const { element } = props;
  const isGradient = element.coverImage && element.coverImage in COVER_GRADIENTS;

  const session = useSession();
  const trpc = useTRPC();

  const isDocument = element.key!.startsWith("/");

  // Use mock data when not logged in, fetch real data when logged in
  const { data } = useQuery({
    ...trpc.document.document.queryOptions({ id: element.key!.slice(1) }),
    enabled: !!session && isDocument,
  });

  // Find document from mock data when not logged in
  const mockDocument = React.useMemo(() => {
    if (!isDocument || session) return null;

    return mockMentionDocuments.find((doc) => doc.id === element.key!.slice(1));
  }, [element.key, isDocument, session]);

  // Use either real data or mock data
  const document = session ? data?.document : mockDocument;

  React.useEffect(() => {
    if (!document) return;
    if (
      element.coverImage !== document.coverImage ||
      element.icon !== document.icon ||
      element.value !== document.title
    ) {
      editor.tf.setNodes<MyMentionElement>(
        {
          coverImage: document.coverImage,
          icon: document.icon,
          value: document.title,
        },
        {
          at: [],
          mode: "lowest",
          match: (n) => n.type === MentionPlugin.key && n.id === element.id,
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document]);

  const previewEditor = useEditorPreview((document?.contentRich as Value | undefined)?.slice(0, 2) ?? []);

  return (
    <div className="flex flex-col overflow-hidden rounded">
      <div
        className={cn("h-10 w-full", isGradient && COVER_GRADIENTS[element.coverImage as keyof typeof COVER_GRADIENTS])}
      >
        {element.coverImage && !isGradient && (
          <Image
            className="size-full object-cover"
            alt={element.value}
            height={40}
            src={element.coverImage}
            width={100}
          />
        )}
      </div>
      <div className="absolute top-5 left-4 text-[30px]">{element.icon}</div>
      <h1 className="mt-5 px-4 text-lg font-bold">{element.value}</h1>
      <EditorStatic variant="mention" className="px-4 text-xs" editor={previewEditor} />
    </div>
  );
}

function UserMentionElement(
  props: PlateElementProps<MyMentionElement> & {
    prefix?: string;
  }
) {
  const { children } = props;
  const element = props.element;
  const readOnly = useReadOnly();
  const mounted = useMounted();

  return (
    <PlateElement
      {...props}
      className={cn(
        "inline-block cursor-pointer align-baseline font-medium text-primary/65",
        !readOnly && "cursor-pointer",
        (element.children[0] as any).bold === true && "font-bold",
        (element.children[0] as any).italic === true && "italic",
        (element.children[0] as any).underline === true && "underline"
      )}
      attributes={{
        ...props.attributes,
        contentEditable: false,
        "data-slate-value": element.value,
        draggable: true,
      }}
    >
      <span className="font-semibold text-primary/45">@</span>
      {mounted && IS_APPLE ? (
        // Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490
        <React.Fragment>
          {children}
          {props.prefix}
          {element.value}
        </React.Fragment>
      ) : (
        // Others like Android https://github.com/ianstormtaylor/slate/pull/5360
        <React.Fragment>
          {props.prefix}
          {element.value}
          {children}
        </React.Fragment>
      )}
    </PlateElement>
  );
}

export function MentionElement(
  props: PlateElementProps<MyMentionElement> & {
    prefix?: string;
  }
) {
  const element = props.element;
  const isDocument = element.key?.startsWith("/");

  return isDocument ? <DocumentMentionElement {...props} /> : <UserMentionElement {...props} />;
}

const useEditorPreview = (value: Value) => {
  const editorStatic = usePlateEditor(
    {
      plugins: BaseEditorKit,
      value,
    },
    [value]
  );

  return editorStatic;
};
