"use client";

import { cn } from "@beep/notes/lib/utils";

import { AIChatPlugin } from "@platejs/ai/react";
import { type CursorData, type CursorOverlayState, useCursorOverlay } from "@platejs/selection/react";
import { RangeApi } from "platejs";
import { usePluginOption } from "platejs/react";

const OVERLAY_ID = "__plate_cursor_overlay__";

// TODO:Move to core
export const getCursorOverlayElement = () => {
  return document.querySelector(`#${OVERLAY_ID}`);
};

export function Cursor({ id, caretPosition, data, selection, selectionRects }: CursorOverlayState<CursorData>) {
  const streaming = usePluginOption(AIChatPlugin, "streaming");

  if (streaming) return null;

  const { style, selectionStyle = style } = data ?? ({} as CursorData);
  const isCursor = RangeApi.isCollapsed(selection);

  return (
    <>
      {selectionRects.map((position, i) => {
        return (
          <div
            id={OVERLAY_ID}
            key={i}
            className={cn(
              "pointer-events-none absolute z-10",
              id === "selection" && "bg-brand/25",
              id === "selection" && isCursor && "bg-primary"
            )}
            style={{
              ...selectionStyle,
              ...position,
            }}
          />
        );
      })}
      {caretPosition && (
        <div
          id={OVERLAY_ID}
          className={cn("pointer-events-none absolute z-10 w-0.5", id === "drag" && "w-px bg-brand")}
          style={{ ...caretPosition, ...style }}
        />
      )}
    </>
  );
}

export function CursorOverlay() {
  const { cursors } = useCursorOverlay();

  return (
    <>
      {cursors.map((cursor) => (
        <Cursor key={cursor.id} {...cursor} />
      ))}
    </>
  );
}
