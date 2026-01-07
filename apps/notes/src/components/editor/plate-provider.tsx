"use client";

import { useAuthValue } from "@beep/notes/components/auth/auth-provider-client";
import { EditorKit } from "@beep/notes/components/editor/editor-kit-app";
import { env } from "@beep/notes/env";
import { useDebouncedCallback } from "@beep/notes/hooks/useDebounceCallback";
import { useInitialLocalStorage } from "@beep/notes/hooks/useLocalStorage";
import { useWarnIfUnsavedChanges } from "@beep/notes/hooks/useWarnIfUnsavedChanges";
import { BaseEditorKit } from "@beep/notes/registry/components/editor/editor-base-kit";
import { useMounted } from "@beep/notes/registry/hooks/use-mounted";
import { RemoteCursorOverlay } from "@beep/notes/registry/ui/remote-cursor-overlay";
import type { AuthUser } from "@beep/notes/server/auth/getAuthUser";
import { useUpdateDocumentValue } from "@beep/notes/trpc/hooks/document-hooks";
import { useDocumentQueryOptions } from "@beep/notes/trpc/hooks/query-options";
import { type YjsConfig as BaseYjsConfig, BaseYjsPlugin } from "@platejs/yjs";
import { YjsPlugin } from "@platejs/yjs/react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { type ExtendConfig, KEYS, type Value } from "platejs";
import { Plate, toTPlatePlugin, usePlateEditor } from "platejs/react";
import React, { useEffect } from "react";
import { getTemplateDocument, type TemplateDocument, useTemplateDocument } from "./utils/useTemplateDocument";

export function DocumentPlate({ children }: { readonly children: React.ReactNode }) {
  const updateDocumentValue = useUpdateDocumentValue();
  const user = useAuthValue("user");

  const queryOptions = useDocumentQueryOptions();
  const { data: documentId } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.id,
  });
  const { data: lockPage } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.lockPage,
  });
  const { data: isArchived } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.isArchived,
  });
  const { data: templateId } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.templateId,
  });
  const { data: contentRich } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.contentRich,
  });

  const { data: isPublished } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.isPublished,
  });

  // Generate a consistent color for the user based on their username

  const value = templateId && !contentRich ? getTemplateDocument(templateId)?.value : (contentRich as Value);

  const isYjsEnabled = Boolean(documentId && isPublished && env.NEXT_PUBLIC_YJS_URL);

  const { cursorColor, roomName, username } = useYjs({
    documentId,
    user,
  });

  const editor = usePlateEditor(
    {
      id: documentId,
      plugins: [
        ...EditorKit,
        yjsPlugin.configure({
          enabled: isYjsEnabled,
          options: {
            cursors: {
              data: { color: cursorColor, name: username },
            },
            providers: [
              {
                options: {
                  name: documentId!,
                  url: env.NEXT_PUBLIC_YJS_URL,
                },
                type: "hocuspocus" as const,
              },
            ],
          },
          render: {
            afterEditable: RemoteCursorOverlay,
          },
        }),
      ],
      skipInitialization: !!isYjsEnabled,
      value: isYjsEnabled ? undefined : value,
    },
    [documentId, isYjsEnabled]
  );

  const mounted = useMounted();

  useEffect(() => {
    if (!mounted || !isYjsEnabled) {
      return;
    }

    editor.setOption(yjsPlugin, "isReady", false);

    void editor.getApi(YjsPlugin).yjs?.init({
      id: roomName,
      autoSelect: "end",
      value,
      onReady: () => {
        editor.setOption(yjsPlugin, "isReady", true);
      },
    });

    return () => {
      editor.getApi(YjsPlugin).yjs?.destroy();
      editor.setOption(yjsPlugin, "isReady", false);
    };
  }, [editor, isYjsEnabled, mounted, roomName, value]);

  return (
    <Plate
      readOnly={lockPage || isArchived}
      onValueChange={({ editor, value }) => {
        if (!isYjsEnabled) {
          updateDocumentValue({ id: editor.id, value });
        }
      }}
      editor={editor}
    >
      {children}
    </Plate>
  );
}

export function PublicPlate({ children }: React.PropsWithChildren) {
  const templateDocument = useTemplateDocument();
  const [template, setTemplate] = useInitialLocalStorage<TemplateDocument | undefined>(
    `potion-2-${templateDocument?.id ?? "ai"}`,
    templateDocument
  );
  const value = template?.value;
  const id = template?.id;
  const editor = usePlateEditor({
    id,
    override: {
      enabled: {
        [KEYS.copilot]: id === "copilot",
      },
    },
    plugins: EditorKit,
    value,
  });

  const onDebouncedDocumentChange = useDebouncedCallback((id: string, v: Value) => {
    setTemplate({
      id,
      icon: null,
      title: template?.title ?? null,
      value: v,
    });
  }, 1000);

  useWarnIfUnsavedChanges({ enabled: onDebouncedDocumentChange.isPending() });

  return (
    <Plate
      onValueChange={({ editor, value }) => {
        if (editor.meta.resetting) {
          delete editor.meta.resetting;

          return;
        }

        onDebouncedDocumentChange(editor.id, value);
      }}
      editor={editor}
    >
      {children}
    </Plate>
  );
}

export function PrintPlate({ children }: React.PropsWithChildren) {
  const searchParams = useSearchParams();
  const disableMedia = searchParams.get("disableMedia") === "true";

  const queryOptions = useDocumentQueryOptions();

  const { data: templateId } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.templateId,
  });

  const { data: contentRich } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.contentRich,
  });

  const value = templateId && !contentRich ? getTemplateDocument(templateId)?.value : (contentRich as Value);

  const editor = usePlateEditor(
    {
      override: {
        enabled: {
          [KEYS.audio]: !disableMedia,
          [KEYS.file]: !disableMedia,
          [KEYS.img]: !disableMedia,
          [KEYS.mediaEmbed]: !disableMedia,
          [KEYS.video]: !disableMedia,
        },
      },
      plugins: BaseEditorKit,
      value,
    },
    [value]
  );
  editor.meta.mode = "print";

  return (
    <Plate readOnly editor={editor}>
      {children}
    </Plate>
  );
}

function useYjs({ documentId, user }: { user: AuthUser | null; documentId?: string }): {
  cursorColor: string;
  roomName: string | undefined;
  username: string;
} {
  const roomName = documentId;

  const cursorColor = React.useMemo(() => {
    if (!user?.username) return "#888888";

    let hash = 0;

    for (let i = 0; i < user.username.length; i++) {
      const codePoint = user.username?.codePointAt(i) ?? 0;
      hash = codePoint + ((hash << 5) - hash);
    }

    const hue = hash % 360;

    return `hsl(${hue}, 70%, 60%)`;
  }, [user?.username]);

  return {
    cursorColor,
    roomName,
    username: user?.username || "Anonymous",
  };
}

type YjsConfig = ExtendConfig<
  BaseYjsConfig,
  {
    isReady: boolean;
  }
>;

export const yjsPlugin = toTPlatePlugin<YjsConfig>(BaseYjsPlugin, {
  options: {
    isReady: false,
  },
});
