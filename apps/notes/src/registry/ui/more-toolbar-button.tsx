"use client";

import { BlockMenuPlugin } from "@platejs/selection/react";
import { MoreHorizontal } from "lucide-react";
import { useEditorRef } from "platejs/react";

import { useOpenState } from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

export function MoreToolbarButton() {
  const editor = useEditorRef();
  const openState = useOpenState();

  return (
    <ToolbarButton
      onClick={(e) => {
        const blockAbove = editor.api.block()?.[0];

        if (!blockAbove) return;

        editor.getApi(BlockMenuPlugin).blockMenu.showContextMenu(blockAbove.id as string, {
          x: e.clientX,
          y: e.clientY,
        });
      }}
      data-plate-prevent-overlay
      pressed={openState.open}
      tooltip="More"
    >
      <MoreHorizontal />
    </ToolbarButton>
  );
}
