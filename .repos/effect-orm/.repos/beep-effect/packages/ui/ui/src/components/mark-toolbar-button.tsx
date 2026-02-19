"use client";

import { useMarkToolbarButton, useMarkToolbarButtonState } from "platejs/react";
import type React from "react";

import { ToolbarButton } from "./toolbar";

export function MarkToolbarButton({
  clear,
  nodeType,
  ...props
}: React.ComponentProps<typeof ToolbarButton> & {
  readonly nodeType: string;
  readonly clear?: undefined | string[] | string;
}) {
  const state = useMarkToolbarButtonState({ nodeType, ...(clear !== undefined ? { clear } : {}) });
  const { props: buttonProps } = useMarkToolbarButton(state);

  return <ToolbarButton {...props} {...buttonProps} />;
}
