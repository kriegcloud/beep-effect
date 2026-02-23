"use client";

import { env } from "@beep/notes/env";
import { useDocumentId } from "@beep/notes/lib/navigation/routes";
import { BaseEditorKit } from "@beep/notes/registry/components/editor/editor-base-kit";
import { downloadFile } from "@beep/notes/registry/lib/download-file";
import { Button } from "@beep/notes/registry/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@beep/notes/registry/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@beep/notes/registry/ui/dropdown-menu";
import { EditorStatic } from "@beep/notes/registry/ui/editor-static";
import { Input } from "@beep/notes/registry/ui/input";
import { honoApi } from "@beep/notes/server/hono/hono-client";
import { useDocumentQueryOptions } from "@beep/notes/trpc/hooks/query-options";
import type { UnsafeTypes } from "@beep/types";
import { MarkdownPlugin } from "@platejs/markdown";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono/client";
import { createSlateEditor } from "platejs";
import { useEditorRef } from "platejs/react";
import { serializeHtml } from "platejs/static";
import type { PaperFormat } from "puppeteer";
import type * as React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Icons } from "../ui/icons";
import { Label } from "../ui/label";
import { TEXT_STYLE_ITEMS } from "./document-menu";

const $post = honoApi.export.pdf.$post;
const $get = honoApi.export.html.$get;

export function ExportDialog() {
  const editor = useEditorRef();

  const [type, setType] = useState("pdf");
  const [pageFormat, setPageFormat] = useState<PaperFormat>("a4");
  const [scale, setScale] = useState("100");
  const [isExporting, setIsExporting] = useState(false);
  const [includeMedia, setIncludeMedia] = useState(true);

  const documentId = useDocumentId();
  const { data: title } = useQuery({
    ...useDocumentQueryOptions(),
    select: (data) => data.document?.title,
  });

  const exportPdf = useMutation<InferResponseType<typeof $post>, Error, InferRequestType<typeof $post>>({
    mutationFn: async (input) => {
      const res = await $post(input);

      if (!res.ok) {
        const error = await res.json();

        throw new Error((error as UnsafeTypes.UnsafeAny).message);
      }

      return await res.blob();
    },
    onError: () => {
      toast.error("Failed to export PDF");
    },
    onMutate: () => {
      setIsExporting(true);
    },
    onSettled: () => {
      setIsExporting(false);
    },
    onSuccess: async (blob: UnsafeTypes.UnsafeAny) => {
      const url = window.URL.createObjectURL(blob);
      await downloadFile(url, `${title}.${type}`);
    },
  });

  const handleExport = () => {
    exportPdf.mutate({
      json: {
        disableMedia: !includeMedia,
        documentId,
        format: pageFormat,
        scale: Number(scale) / 100,
      },
    });
  };

  const queryOptions = useDocumentQueryOptions();

  const { data: textStyle } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.textStyle,
  });

  const fontFamily = useMemo(
    () => ({
      fontFamily: TEXT_STYLE_ITEMS.find((item) => item.key === textStyle)?.fontFamily,
    }),
    [textStyle]
  );
  const exportHtml = useMutation<InferResponseType<typeof $get>, Error, InferRequestType<typeof $get>>({
    mutationFn: async () => {
      const res = await $get();

      if (!res.ok) {
        const error = await res.json();

        throw new Error((error as UnsafeTypes.UnsafeAny).message);
      }

      return await res.text();
    },
    onError: () => {
      toast.error("Failed to export PDF");
    },
    onMutate: () => {
      setIsExporting(true);
    },
    onSettled: () => {
      setIsExporting(false);
    },
    onSuccess: async (css: UnsafeTypes.UnsafeAny) => {
      const editorStatic = createSlateEditor({
        plugins: BaseEditorKit,
        value: editor.children,
      });

      const editorHtml = await serializeHtml(editorStatic, {
        editorComponent: EditorStatic,
        props: {
          style: {
            padding: "0 calc(50% - 350px)",
            paddingBottom: "",
            ...fontFamily,
          },
        },
      });

      const tailwindCss = `<link rel="stylesheet" href="${env.NEXT_PUBLIC_SITE_URL}/css/tailwind.css">`;
      const katexCss = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.18/dist/katex.css" integrity="sha384-9PvLvaiSKCPkFKB1ZsEoTjgnJn+O3KvEwtsz37/XrkYft3DTk2gHdYvd9oWgW3tV" crossorigin="anonymous">`;

      const html = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="color-scheme" content="light" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap"
            rel="stylesheet"
          />
          <style>
            :root {
              --font-sans: 'Inter', sans-serif;
              --font-mono: 'JetBrains Mono', monospace;
            }
          ${css}
          </style>
          ${tailwindCss}
          ${katexCss}
        </head>
        <body>
          ${editorHtml}
        </body>
      </html>`;

      const url = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;

      void downloadFile(url, "plate.html");
    },
  });

  const handleExportHtml = () => {
    exportHtml.mutate({});
  };

  const handleExportMarkdown = async () => {
    const md = editor.getApi(MarkdownPlugin).markdown.serialize();
    const url = `data:text/markdown;charset=utf-8,${encodeURIComponent(md)}`;
    await downloadFile(url, "app.md");
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScale(e.target.value);
  };

  return (
    <DialogContent className="px-10 md:max-w-[445px]">
      <DialogHeader>
        <DialogTitle>Export</DialogTitle>
        <DialogDescription>Choose your export preferences</DialogDescription>
      </DialogHeader>
      <div className="grid gap-2 py-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="format">Export format</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isExporting}>
              <Button variant="ghost" className="ml-auto w-fit justify-between">
                {type.toUpperCase()}
                <Icons.chevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-32 py-1">
              <DropdownMenuItem onClick={() => setType("pdf")}>PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setType("html")}>HTML</DropdownMenuItem>
              <DropdownMenuItem disabled onClick={() => setType("word")}>
                Word
                <DropdownMenuShortcut>soon</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setType("markdown")}>Markdown</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="format">Include content</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isExporting}>
              <Button variant="ghost" className="ml-auto w-fit justify-between">
                {includeMedia ? "Everything" : "No files or images"}
                <Icons.chevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-32 py-1">
              <DropdownMenuItem onClick={() => setIncludeMedia(true)}>Everything</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIncludeMedia(false)}>No files or images</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {type === "pdf" && (
          <>
            <div className="flex items-center gap-2">
              <Label htmlFor="format">Page format</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isExporting}>
                  <Button variant="ghost" className="ml-auto w-fit justify-between">
                    {pageFormat.charAt(0).toUpperCase() + pageFormat.slice(1).toLowerCase()}
                    <Icons.chevronDown className="ml-2 size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-32 py-1">
                  <DropdownMenuItem onClick={() => setPageFormat("a4")}>A4</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPageFormat("a3")}>A3</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPageFormat("letter")}>Letter</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPageFormat("legal")}>Legal</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPageFormat("tabloid")}>Tabloid</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="scale">Scale (%)</Label>
                <Input
                  id="scale"
                  className="ml-auto w-16 rounded-md border px-2 py-1 text-center"
                  disabled={isExporting}
                  value={scale}
                  onChange={handleScaleChange}
                />
              </div>
              {(Number(scale) < 10 || Number(scale) > 200) && (
                <span className="text-sm text-red-500">Scale percent must be a number between 10 and 200</span>
              )}
            </div>
          </>
        )}
      </div>
      <DialogFooter>
        <Button
          variant="brand"
          disabled={isExporting}
          onClick={() => {
            switch (type) {
              case "html": {
                void handleExportHtml();

                break;
              }
              case "markdown": {
                void handleExportMarkdown();

                break;
              }
              case "pdf": {
                handleExport();

                break;
              }
              // No default
            }
          }}
        >
          {isExporting ? (
            <>
              <Icons.spinner className="mr-2 size-4 animate-spin" />
              Exporting...
            </>
          ) : (
            "Export file"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
