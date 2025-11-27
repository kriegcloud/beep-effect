"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@beep/ui/components/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@beep/ui/components/dropdown-menu";
import { Input } from "@beep/ui/components/input";
import { PlaceholderPlugin } from "@platejs/media/react";
import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import { AudioLinesIcon, FileUpIcon, FilmIcon, ImageIcon, LinkIcon } from "lucide-react";
import { isUrl, KEYS } from "platejs";
import { useEditorRef } from "platejs/react";
import React from "react";
import { toast } from "sonner";
import { useFilePicker } from "use-file-picker";

import { ToolbarSplitButton, ToolbarSplitButtonPrimary, ToolbarSplitButtonSecondary } from "./toolbar";

const MEDIA_CONFIG: Record<
  string,
  {
    readonly accept: string[];
    readonly icon: React.ReactNode;
    readonly title: string;
    readonly tooltip: string;
  }
> = {
  [KEYS.audio]: {
    accept: ["audio/*"],
    icon: <AudioLinesIcon className="size-4" />,
    title: "Insert Audio",
    tooltip: "Audio",
  },
  [KEYS.file]: {
    accept: ["*"],
    icon: <FileUpIcon className="size-4" />,
    title: "Insert File",
    tooltip: "File",
  },
  [KEYS.img]: {
    accept: ["image/*"],
    icon: <ImageIcon className="size-4" />,
    title: "Insert Image",
    tooltip: "Image",
  },
  [KEYS.video]: {
    accept: ["video/*"],
    icon: <FilmIcon className="size-4" />,
    title: "Insert Video",
    tooltip: "Video",
  },
};

export function MediaToolbarButton({ nodeType, ...props }: DropdownMenuProps & { readonly nodeType: string }) {
  const currentConfig = MEDIA_CONFIG[nodeType];

  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const { openFilePicker } = useFilePicker({
    accept: currentConfig?.accept ?? ["*"],
    multiple: true,
    onFilesSelected: ({ plainFiles: updatedFiles }) => {
      editor.getTransforms(PlaceholderPlugin).insert.media(updatedFiles);
    },
  });

  if (!currentConfig) {
    return null;
  }

  return (
    <>
      <ToolbarSplitButton
        onClick={() => {
          openFilePicker();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        pressed={open}
      >
        <ToolbarSplitButtonPrimary>{currentConfig.icon}</ToolbarSplitButtonPrimary>

        <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
          <DropdownMenuTrigger asChild>
            <ToolbarSplitButtonSecondary />
          </DropdownMenuTrigger>

          <DropdownMenuContent onClick={(e) => e.stopPropagation()} align="start" alignOffset={-32}>
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => openFilePicker()}>
                {currentConfig.icon}
                Upload from computer
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
                <LinkIcon />
                Insert via URL
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ToolbarSplitButton>

      <AlertDialog
        open={dialogOpen}
        onOpenChange={(value) => {
          setDialogOpen(value);
        }}
      >
        <AlertDialogContent className="gap-6">
          <MediaUrlDialogContent currentConfig={currentConfig} nodeType={nodeType} setOpen={setDialogOpen} />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function MediaUrlDialogContent({
  currentConfig,
  nodeType,
  setOpen,
}: {
  readonly currentConfig: (typeof MEDIA_CONFIG)[string];
  readonly nodeType: string;
  readonly setOpen: (value: boolean) => void;
}) {
  const editor = useEditorRef();
  const [url, setUrl] = React.useState("");

  const embedMedia = React.useCallback(() => {
    if (!isUrl(url)) {
      toast.error("Invalid URL");
      return;
    }

    setOpen(false);
    editor.tf.insertNodes({
      children: [{ text: "" }],
      name: nodeType === KEYS.file ? url.split("/").pop() : undefined,
      type: nodeType,
      url,
    });
  }, [url, editor, nodeType, setOpen]);

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{currentConfig.title}</AlertDialogTitle>
      </AlertDialogHeader>

      <AlertDialogDescription className="group relative w-full">
        <label
          className="-translate-y-1/2 absolute top-1/2 block cursor-text px-1 text-muted-foreground/70 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:font-medium group-focus-within:text-foreground group-focus-within:text-xs has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-foreground has-[+input:not(:placeholder-shown)]:text-xs"
          htmlFor="url"
        >
          <span className="inline-flex bg-background px-2">URL</span>
        </label>
        <Input
          id="url"
          className="w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") embedMedia();
          }}
          placeholder=""
          type="url"
          autoFocus
        />
      </AlertDialogDescription>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={(e) => {
            e.preventDefault();
            embedMedia();
          }}
        >
          Accept
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}
