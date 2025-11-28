"use client";

import { linkPlugin } from "@beep/notes/registry/components/editor/plugins/link-kit";

import { Link } from "lucide-react";
import { useEditorPlugin } from "platejs/react";
import type * as React from "react";

import { ToolbarButton } from "./toolbar";

export function LinkToolbarButton(props: React.ComponentProps<typeof ToolbarButton>) {
  const { api } = useEditorPlugin(linkPlugin);

  return (
    <ToolbarButton onClick={() => api.a.show()} data-plate-focus tooltip="Link" {...props}>
      <Link />
    </ToolbarButton>
  );
}
