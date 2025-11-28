"use client";

import { BaseEditorKit } from "@beep/notes/registry/components/editor/editor-base-kit";
import type { MyMentionElement } from "@beep/notes/registry/components/editor/plate-types";
import { insertInlineElement } from "@beep/notes/registry/components/editor/transforms";
import { useDebounce } from "@beep/notes/registry/hooks/use-debounce";
import { DatePlugin } from "@platejs/date/react";
import { MentionPlugin } from "@platejs/mention/react";
import { cn } from "@udecode/cn";
import { ArrowUpRightIcon, FileTextIcon } from "lucide-react";
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
import React, { useEffect, useState } from "react";
import { useMounted } from "react-tweet";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { EditorStatic } from "./editor-static";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from "./inline-combobox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface DocumentItem {
  id: string;
  contentRich: {
    children: { text: string }[];
    type: string;
  }[];
  coverImage: string;
  icon: string;
  title: string;
}

interface PeopleComboboxGroupProps {
  search: string;
  onUserHover: (name: string) => void;
  onUserSelect: (user: UserItem) => void;
}

export const mockMentionDocuments = [
  {
    id: "docs/examples/ai",
    contentRich: [
      {
        children: [
          {
            text: "A comprehensive guide to using AI features in your documents.",
          },
        ],
        type: "p",
      },
    ],
    coverImage: "https://picsum.photos/seed/ai/800/400",
    icon: "📋",
    title: "AI",
  },
  {
    id: "docs/examples/callout",
    contentRich: [
      {
        children: [
          {
            text: "Learn how to use callouts to highlight important information.",
          },
        ],
        type: "p",
      },
    ],
    coverImage: "https://picsum.photos/seed/callout/800/400",
    icon: "🧰",
    title: "Callout",
  },
  {
    id: "docs/examples/equation",
    contentRich: [
      {
        children: [{ text: "Everything you need to know about mathematical equations." }],
        type: "p",
      },
    ],
    coverImage: "https://picsum.photos/seed/equation/800/400",
    icon: "🧮",
    title: "Equation",
  },
  {
    id: "docs/examples/toc",
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
    coverImage: "https://picsum.photos/seed/toc/800/400",
    icon: "📚",
    title: "Table of Contents",
  },
];

interface UserItem {
  id: string;
  email: string;
  name: string;
  profileImageUrl: string;
}

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

export function MentionInputElement(props: PlateElementProps) {
  const [placeholder, setPlaceholder] = useState("Mention a person,page,or date...");

  const { children, editor, element } = props;
  const [search, setSearch] = React.useState("");

  return (
    <PlateElement {...props} as="span">
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

interface DocumentComboboxGroupProps {
  search: string;
  onDocumentHover: (title: string) => void;
  onDocumentSelect: (document: DocumentItem) => void;
}

function PeopleComboboxGroup({ search: searchRaw, onUserHover, onUserSelect }: PeopleComboboxGroupProps) {
  const search = useDebounce(searchRaw, 100);
  const [allUsers, setAllUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    // Filter mockUsers based on search
    const filteredUsers = mockUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    );
    setAllUsers(filteredUsers);
  }, [search]);

  if (allUsers.length === 0) {
    return null;
  }

  return (
    <InlineComboboxGroup>
      <InlineComboboxGroupLabel>People</InlineComboboxGroupLabel>

      {allUsers.map((user) => (
        <InlineComboboxItem
          key={user.id}
          value={user.name ?? user.email!}
          onClick={() => onUserSelect(user as UserItem)}
          onFocus={() => onUserHover(user.name ?? user.email!)}
          onMouseEnter={() => onUserHover(user.name ?? user.email!)}
        >
          <Avatar className="mr-2.5 size-5">
            <AvatarImage alt={user.name!} src={user.profileImageUrl!} />
            <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          {user.name ?? user.email}
        </InlineComboboxItem>
      ))}
    </InlineComboboxGroup>
  );
}

function DocumentComboboxGroup({ search: searchRaw, onDocumentHover, onDocumentSelect }: DocumentComboboxGroupProps) {
  const search = useDebounce(searchRaw, 500);
  const [allDocuments, setAllDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    // Filter mockDocuments based on search
    const filteredDocs = mockMentionDocuments.filter((doc) => doc.title.toLowerCase().includes(search.toLowerCase()));
    setAllDocuments(filteredDocs);
  }, [search]);

  if (allDocuments.length === 0) {
    return null;
  }

  return (
    <InlineComboboxGroup>
      <InlineComboboxGroupLabel>Link to page</InlineComboboxGroupLabel>

      {allDocuments.map((document) => (
        <InlineComboboxItem
          key={document.id}
          value={document.title || "Untitled Document"}
          onClick={() => onDocumentSelect(document as DocumentItem)}
          onFocus={() => onDocumentHover(document.title ?? "")}
          onMouseEnter={() => onDocumentHover(document.title ?? "")}
        >
          <span className="mr-2 size-5">{document.icon ?? <FileTextIcon />}</span>
          {document.title ?? "Untitled Document"}
        </InlineComboboxItem>
      ))}
    </InlineComboboxGroup>
  );
}

const openDocument = (id: string) => {
  const host = window.location.host;
  const baseUrl =
    // TODO: Remove this for demo only
    host === "pro.todox.com" ? "https://app.todox.com" : window.location.origin;

  window.open(`${baseUrl}/${id}`, "_self");
};

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
        openDocument(element.key!.slice(1));
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
                    openDocument(element.key!.slice(1));
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

  const isDocument = element.key!.startsWith("/");

  // Find the document from mockDocuments
  const document = React.useMemo(() => {
    if (!isDocument) return null;

    return mockMentionDocuments.find((doc) => doc.id === element.key!.slice(1));
  }, [element.key, isDocument]);

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
      <div className={cn("h-10 w-full")}>
        {element.coverImage && (
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
      <EditorStatic
        variant="mention"
        className="px-4 text-xs"
        // components={basicComponents}
        editor={previewEditor}
      />
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
