"use client";

import { cn } from "@beep/notes/lib/utils";
import { linkPlugin } from "@beep/notes/registry/components/editor/plugins/link-kit";
import { AIChatPlugin } from "@platejs/ai/react";
import {
  type FloatingToolbarState,
  flip,
  offset,
  shift,
  useFloatingToolbar,
  useFloatingToolbarState,
} from "@platejs/floating";
import { BlockSelectionPlugin } from "@platejs/selection/react";
import { useComposedRef, useEditorRef, useEventEditorValue, usePluginOption } from "platejs/react";
import type * as React from "react";

import { Toolbar } from "./toolbar";

export function FloatingToolbar({
  children,
  ref: refProp,
  state,
  ...props
}: React.ComponentProps<typeof Toolbar> & {
  readonly state?: undefined | FloatingToolbarState;
}) {
  const editor = useEditorRef();
  const focusedEditorId = useEventEditorValue("focus");
  const isFloatingLinkOpen = !!usePluginOption(linkPlugin, "mode");
  const aiOpen = usePluginOption(AIChatPlugin, "open");
  const isSelectingSomeBlocks = usePluginOption(BlockSelectionPlugin, "isSelectingSome");

  const floatingToolbarState = useFloatingToolbarState({
    editorId: editor.id,
    focusedEditorId,
    hideToolbar: aiOpen || isFloatingLinkOpen || isSelectingSomeBlocks,
    ...state,
    floatingOptions: {
      middleware: [
        offset({
          crossAxis: -24,
          mainAxis: 12,
        }),
        shift({ padding: 50 }),
        flip({
          fallbackPlacements: ["top-start", "top-end", "bottom-start", "bottom-end"],
          padding: 12,
        }),
      ],
      placement: "top-start",
      ...state?.floatingOptions,
    },
  });

  const { clickOutsideRef, hidden, props: rootProps, ref: floatingRef } = useFloatingToolbar(floatingToolbarState);

  const ref = useComposedRef<HTMLDivElement>(refProp, floatingRef);

  if (hidden) return null;

  return (
    <div ref={clickOutsideRef}>
      <Toolbar
        ref={ref}
        className={cn(
          "absolute z-50 animate-zoom rounded-lg bg-popover p-1 whitespace-nowrap opacity-100 shadow-toolbar print:hidden",
          "scrollbar-hide max-w-[80vw] overflow-x-auto"
        )}
        {...rootProps}
        {...props}
      >
        {children}
      </Toolbar>
    </div>
  );
}
