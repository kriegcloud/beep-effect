"use client";

import { cn } from "@beep/notes/lib/utils";

import { DndPlugin } from "@platejs/dnd";
import { useBlockSelected } from "@platejs/selection/react";
import { cva } from "class-variance-authority";
import { type PlateElementProps, usePluginOption } from "platejs/react";

export const blockSelectionVariants = cva(
  cn(
    'before:pointer-events-none before:absolute before:inset-0 before:z-1 before:size-full before:rounded-[4px] before:content-[""]',
    "before:bg-brand/15",
    "before:transition-opacity before:duration-200"
  ),
  {
    defaultVariants: {
      active: true,
    },
    variants: {
      active: {
        false: "before:opacity-0",
        true: "before:opacity-100",
      },
    },
  }
);

export function BlockSelection(props: PlateElementProps) {
  const isBlockSelected = useBlockSelected();
  const isDragging = usePluginOption(DndPlugin, "isDragging");

  if (!isBlockSelected || props.plugin.key === "tr" || props.plugin.key === "table") return null;

  return (
    <div
      className={blockSelectionVariants({
        active: isBlockSelected && !isDragging,
      })}
      data-slot="block-selection"
    />
  );
}
