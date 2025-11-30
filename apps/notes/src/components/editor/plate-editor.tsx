"use client";

import { yjsPlugin } from "@beep/notes/components/editor/plate-provider";
import { env } from "@beep/notes/env";
import { cn } from "@beep/notes/lib/utils";
import { Editor, EditorContainer } from "@beep/notes/registry/ui/editor";
import { TocSidebar } from "@beep/notes/registry/ui/toc-sidebar";
import { useDocumentQueryOptions } from "@beep/notes/trpc/hooks/query-options";
import { AIChatPlugin } from "@platejs/ai/react";
import { useQuery } from "@tanstack/react-query";
import { usePluginOption } from "platejs/react";
import { useMemo } from "react";

import { TEXT_STYLE_ITEMS } from "../navbar/document-menu";
import { Skeleton } from "../ui/skeleton";

export const PlateEditor = ({ mode }: { mode?: "print" }) => {
  const queryOptions = useDocumentQueryOptions();

  const contentRef = usePluginOption(AIChatPlugin, "contentRef") as any;

  const { data: toc = true, isLoading } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.toc,
  });
  const { data: fullWidth } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.fullWidth,
  });
  const { data: smallText } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.smallText,
  });
  const { data: textStyle } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.textStyle,
  });
  const { data: documentId } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.id,
  });
  const { data: isPublished } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.isPublished,
  });

  const fontFamily = useMemo(
    () => ({
      fontFamily: TEXT_STYLE_ITEMS.find((item) => item.key === textStyle)?.fontFamily,
    }),
    [textStyle]
  );

  const isYjsReady = usePluginOption(yjsPlugin, "isReady");
  const isYjsEnabled = Boolean(documentId && isPublished && env.NEXT_PUBLIC_YJS_URL);

  // Show loading state if Yjs is enabled but not ready yet
  if (isYjsEnabled && !isYjsReady) {
    return (
      <div>
        <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
          <div className="space-y-4 pt-4 pl-8">
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-8 w-3/5" />
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">Connecting to collaboration server...</div>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div>
        <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
          <div className="space-y-4 pt-4 pl-8">
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-8 w-3/5" />
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={contentRef} className="mt-2 flex-1">
      {toc && mode !== "print" && <TocSidebar className="top-[130px]" topOffset={30} />}

      <EditorContainer>
        <Editor
          variant={fullWidth ? "fullWidth" : "default"}
          className={cn(smallText && "text-sm")}
          style={fontFamily}
        />
      </EditorContainer>
    </div>
  );
};
