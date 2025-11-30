"use client";

import { useCurrentUser } from "@beep/notes/components/auth/useCurrentUser";
import { pushModal } from "@beep/notes/components/modals";
import { routes, useDocumentId } from "@beep/notes/lib/navigation/routes";
import { TextStyle } from "@beep/notes/lib/types";
import { cn } from "@beep/notes/lib/utils";
import { Button } from "@beep/notes/registry/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beep/notes/registry/ui/dropdown-menu";
import { useArchiveDocumentMutation, useUpdateDocumentMutation } from "@beep/notes/trpc/hooks/document-hooks";
import { useDocumentQueryOptions } from "@beep/notes/trpc/hooks/query-options";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLineIcon, ArrowUpToLineIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEditorRef } from "platejs/react";
import React, { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { useAuthGuard } from "../auth/useAuthGuard";
import { getEditorWordCount } from "../editor/utils";
import { Icons } from "../ui/icons";
import { Skeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";

export const TEXT_STYLE_ITEMS: {
  readonly key: TextStyle;
  readonly fontFamily: string;
  readonly label: string;
  readonly tooltip: string;
}[] = [
  {
    key: TextStyle.DEFAULT,
    fontFamily: "inherit",
    label: "Default",
    tooltip: "Standard sans-serif",
  },
  {
    key: TextStyle.SERIF,
    fontFamily: "Lyon-Text, Georgia, ui-serif, serif",
    label: "Serif",
    tooltip: "Elegant style for formal writing",
  },
  {
    key: TextStyle.MONO,
    fontFamily: "iawriter-mono, Nitti, Menlo, Courier, monospace",
    label: "Mono",
    tooltip: "Fixed-width font for code",
  },
];

const SWITCH_ITEMS: {
  key: "fullWidth" | "lockPage" | "smallText" | "toc";
  label: string;
}[] = [
  {
    key: "smallText",
    label: "Small text",
  },
  {
    key: "fullWidth",
    label: "Full width",
  },
  {
    key: "lockPage",
    label: "Lock page",
  },
  {
    key: "toc",
    label: "Table of contents",
  },
];

export const DocumentMenu = React.memo(() => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <Icons.moreX size="md" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" alignOffset={8}>
        <DocumentMenuContent />
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

function DocumentMenuContent() {
  const authGuard = useAuthGuard();
  const documentId = useDocumentId();
  const editor = useEditorRef();
  const queryOptions = useDocumentQueryOptions();

  const wordCount = useMemo(() => {
    return getEditorWordCount(editor);
  }, [editor]);

  const { data: updatedAt } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.updatedAt,
  });

  const { data: textStyle } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.textStyle,
  });

  const { data: lockPage } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.lockPage,
  });

  const { data: smallText } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.smallText,
  });

  const { data: fullWidth } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.fullWidth,
  });

  const { data: toc } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.toc,
  });

  const documentCustom = React.useMemo(
    () => ({
      fullWidth,
      lockPage,
      smallText,
      textStyle: textStyle ?? TextStyle.DEFAULT,
      toc: toc ?? true,
    }),
    [fullWidth, lockPage, smallText, textStyle, toc]
  );

  const router = useRouter();

  const archiveDocument = useArchiveDocumentMutation();
  const updateDocument = useUpdateDocumentMutation();

  const user = useCurrentUser();
  const onArchive = () => {
    const promise = archiveDocument.mutateAsync({ id: documentId });

    toast.promise(promise, {
      error: "Failed to archive note!",
      loading: "Moving to trash...",
      success: "Note moved to trash.",
    });

    router.push(routes.home());
  };

  const onCustomDocument = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      key: "fullWidth" | "lockPage" | "smallText" | "textStyle" | "toc",
      value: TextStyle | boolean
    ) => {
      e.preventDefault();
      updateDocument.mutate({ [key]: value, id: documentId });
    },
    [documentId, updateDocument]
  );

  return (
    <>
      <DropdownMenuGroup className="grid grid-cols-3 gap-0.5 px-3 py-1.5">
        {TEXT_STYLE_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item.key}
            asChild
            size="none"
            onClick={(e) => authGuard(() => onCustomDocument(e, "textStyle", item.key))}
          >
            <Button
              variant="ghost"
              className="flex h-auto w-full flex-col justify-between px-1.5 pt-2.5 pb-1.5 text-xs"
              tooltip={item.tooltip}
              tooltipContentProps={{ side: "bottom" }}
            >
              <div
                className={cn(
                  "text-[24px] font-medium text-foreground",
                  item.key === documentCustom.textStyle && "text-brand"
                )}
                style={{ fontFamily: item.fontFamily }}
              >
                Ag
              </div>
              <span className="text-xs"> {item.label}</span>
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup className="py-1.5">
        {SWITCH_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item.label}
            className="flex items-center justify-between"
            onClick={(e) => authGuard(() => onCustomDocument(e, item.key, !documentCustom[item.key]))}
          >
            <span>{item.label}</span>
            <Switch checked={documentCustom[item.key] ?? false} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => authGuard(onArchive)}>
          <Icons.trash />
          Move to Trash
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem
          onClick={() => {
            editor.undo();
          }}
        >
          <Icons.undo />
          Undo
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            authGuard(() => {
              pushModal("VersionHistory", {
                activeVersionId: 1,
              });
            })
          }
        >
          <Icons.history />
          Version history
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => authGuard(() => pushModal("Import"))}>
          <ArrowDownToLineIcon />
          Import
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => authGuard(() => pushModal("Export"))}>
          <ArrowUpToLineIcon />
          Export
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />

      <div className="space-y-1 p-3 text-xs text-muted-foreground/90">
        <div>Word count: {wordCount}</div>
        <div>Last edited by {user?.name}</div>
        <div>
          {updatedAt &&
            new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }).format(new Date(updatedAt))}
        </div>
      </div>
    </>
  );
}

export function DocumentMenuSkeleton() {
  return <Skeleton className="mt-1 h-6 w-10" />;
}
