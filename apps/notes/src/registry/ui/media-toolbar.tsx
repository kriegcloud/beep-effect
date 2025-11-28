"use client";

import { cn } from "@beep/notes/lib/utils";
import { downloadFile } from "@beep/notes/registry/lib/download-file";
import { showCaption } from "@platejs/caption/react";
import {
  openImagePreview,
  useMediaController,
  useMediaControllerDropDownMenu,
  useMediaControllerState,
} from "@platejs/media/react";
import { BlockMenuPlugin } from "@platejs/selection/react";
import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  CaptionsIcon,
  CircleArrowDownIcon,
  MoreHorizontalIcon,
  MoveUpRightIcon,
  ZoomInIcon,
} from "lucide-react";
import type { TMediaElement, TTextAlignProps } from "platejs";
import { KEYS } from "platejs";
import { useEditorRef, useElement } from "platejs/react";
import type * as React from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { Toolbar, ToolbarButton, toolbarButtonVariants } from "./toolbar";

export function MediaToolbar({ className, ...props }: React.ComponentProps<typeof Toolbar>) {
  return (
    <Toolbar
      variant="media"
      className={cn(
        "group-data-[readonly=true]/editor:hidden",
        "top-1 right-1 opacity-0 group-hover/media:opacity-100",
        "group-has-data-[resizing=true]/media:opacity-0 group-has-data-[state=open]/media:opacity-100 group-data-[state=open]/context-menu:opacity-0"
      )}
      {...props}
    >
      <MediaToolbarButtons />
    </Toolbar>
  );
}

const alignItems = [
  {
    icon: AlignLeft,
    value: "left",
  },
  {
    icon: AlignCenter,
    value: "center",
  },
  {
    icon: AlignRight,
    value: "right",
  },
];

function MediaToolbarButtons() {
  const editor = useEditorRef();
  const element = useElement<TMediaElement>();
  const state = useMediaControllerState();
  const { MediaControllerDropDownMenuProps: mediaToolbarDropDownMenuProps } = useMediaController(state);

  const handleDownload = () => {
    toast.promise(downloadFile(element.url, element.id || "file"), {
      error: "Download failed. Please try again.",
      loading: "Downloading...",
    });
  };

  return (
    <>
      <MediaAlignButton {...mediaToolbarDropDownMenuProps} />
      <ToolbarButton size="none" variant="media" onClick={() => showCaption(editor, element)} tooltip="Caption">
        <CaptionsIcon />
      </ToolbarButton>
      {element.type === KEYS.img && (
        <ToolbarButton
          size="none"
          variant="media"
          onClick={() => {
            openImagePreview(editor, element);
          }}
          tooltip="Expand"
        >
          <ZoomInIcon />
        </ToolbarButton>
      )}

      {element.type === KEYS.img && (
        <ToolbarButton size="none" variant="media" onClick={handleDownload} tooltip="Download">
          <CircleArrowDownIcon />
        </ToolbarButton>
      )}

      {element.type !== KEYS.img && (
        <ToolbarButton
          size="none"
          variant="media"
          onClick={() => {
            window.open(element.url, "_blank");
          }}
          tooltip="Original"
        >
          <MoveUpRightIcon />
        </ToolbarButton>
      )}

      <ToolbarButton
        size="none"
        variant="media"
        onClick={(e) => {
          editor.getApi(BlockMenuPlugin).blockMenu.showContextMenu(element.id as string, {
            x: e.clientX,
            y: e.clientY,
          });
        }}
        tooltip="More actions"
      >
        <MoreHorizontalIcon />
      </ToolbarButton>
    </>
  );
}

function MediaAlignButton({
  children,
  ...props
}: {
  setAlignOpen: React.Dispatch<React.SetStateAction<boolean>>;
} & DropdownMenuProps) {
  const editor = useEditorRef();
  const element = useElement<TMediaElement & TTextAlignProps>();
  const openState = useOpenState();

  const value = element.align ?? "left";

  const IconValue = alignItems.find((item) => item.value === value)?.icon ?? AlignLeft;

  useMediaControllerDropDownMenu({
    openState,
    setAlignOpen: props.setAlignOpen,
  });

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton size="none" variant="media" data-state={openState.open ? "open" : "closed"} tooltip="Align">
          <IconValue className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-0 rounded-md border-none bg-black/60 p-0 shadow-none"
        align="start"
        portal={false}
      >
        <DropdownMenuRadioGroup
          className="flex hover:bg-transparent"
          value={value}
          onValueChange={(value) => {
            editor.tf.setNodes({ align: value as any }, { at: element });
          }}
        >
          {alignItems.map(({ icon: Icon, value: itemValue }) => (
            <DropdownMenuRadioItem
              key={itemValue}
              className={cn(
                toolbarButtonVariants({
                  size: "none",
                  variant: "media",
                }),
                "size-[26px] opacity-60 hover:opacity-100 data-[state=checked]:bg-black/5 data-[state=checked]:opacity-100"
              )}
              value={itemValue}
              hideIcon
            >
              <Icon className="size-4" />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
