"use client";

import { useEditorRef, useMarkToolbarButton, useMarkToolbarButtonState } from "platejs/react";
import type * as React from "react";

import { ToolbarButton } from "./toolbar";

export function MarkToolbarButton({
  clear,
  nodeType,
  ...props
}: React.ComponentProps<typeof ToolbarButton> & {
  readonly nodeType: string;
  readonly clear?: undefined | string[] | string;
}) {
  const editor = useEditorRef();
  const stateProps: Record<string, unknown> = { nodeType };
  if (clear !== undefined) {
    stateProps.clear = clear;
  }
  const state = useMarkToolbarButtonState(stateProps as any);
  const { props: buttonProps } = useMarkToolbarButton(state);

  return (
    <ToolbarButton
      {...buttonProps}
      {...props}
      onClick={() => {
        buttonProps.onClick?.();
        editor.tf.focus();
      }}
    />
  );
}
