"use client";

import { cn } from "@beep/notes/lib/utils";
import { ResizableProvider } from "@platejs/resizable";
import type { TColumnElement } from "platejs";
import { PlateElement, type PlateElementProps, useElement, useReadOnly, withHOC } from "platejs/react";

export const ColumnElement = withHOC(ResizableProvider, function ColumnElement(props: PlateElementProps) {
  const readOnly = useReadOnly();
  const { width } = useElement<TColumnElement>();

  return (
    <PlateElement
      className={cn(!readOnly && "rounded-lg border border-dashed p-1.5")}
      style={{ width: width ?? "100%" }}
      {...props}
    />
  );
});

export function ColumnGroupElement(props: PlateElementProps) {
  return (
    <PlateElement className="mb-1" {...props}>
      <div className="flex size-full gap-4 rounded">{props.children}</div>
    </PlateElement>
  );
}
