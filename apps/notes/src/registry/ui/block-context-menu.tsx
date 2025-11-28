"use client";

import { cn } from "@beep/notes/lib/utils";
import { useIsTouchDevice } from "@beep/notes/registry/hooks/use-is-touch-device";
import { useLockScroll } from "@beep/notes/registry/hooks/use-lock-scroll";
import { BLOCK_CONTEXT_MENU_ID, BlockMenuPlugin } from "@platejs/selection/react";
import { MoreHorizontal } from "lucide-react";
import { useEditorPlugin, useEditorRef, useElement, usePluginOption } from "platejs/react";
import type * as React from "react";

import { BlockMenu } from "./block-menu";
import { Button, type ButtonProps } from "./button";
import { useContextMenu } from "./menu";

export function BlockContextMenu({ children }: { children: React.ReactNode }) {
  const { api, editor } = useEditorPlugin(BlockMenuPlugin);
  const anchorRect = usePluginOption(BlockMenuPlugin, "position");
  const openId = usePluginOption(BlockMenuPlugin, "openId");
  const isTouch = useIsTouchDevice();

  useLockScroll(openId === BLOCK_CONTEXT_MENU_ID, `#${editor.meta.uid}`);

  const { getAnchorRect, show, store } = useContextMenu(anchorRect);

  if (isTouch) {
    return children;
  }

  return (
    <div
      className="group/context-menu w-full"
      onContextMenu={(event) => {
        const dataset = (event.target as HTMLElement).dataset;

        const disabled = dataset?.slateEditor === "true";

        if (disabled) return;

        event.preventDefault();

        show();
        api.blockMenu.show(BLOCK_CONTEXT_MENU_ID, {
          x: event.clientX,
          y: event.clientY,
        });
      }}
      data-plate-selectable
      data-state={openId === BLOCK_CONTEXT_MENU_ID ? "open" : "closed"}
    >
      {children}

      <BlockMenu open={openId === BLOCK_CONTEXT_MENU_ID} getAnchorRect={getAnchorRect} store={store} />
    </div>
  );
}

export function BlockActionButton({
  className,
  defaultStyles = true,
  ...props
}: Partial<ButtonProps> & { defaultStyles?: boolean }) {
  const editor = useEditorRef();
  const element = useElement();

  return (
    <Button
      size="blockAction"
      variant="blockAction"
      className={cn(
        defaultStyles && "absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        editor.getApi(BlockMenuPlugin).blockMenu.showContextMenu(element.id as string, {
          x: e.clientX,
          y: e.clientY,
        });
      }}
      contentEditable={false}
      tooltip="More actions"
      {...props}
    >
      <MoreHorizontal />
    </Button>
  );
}
