"use client";

import { exact } from "@beep/utils/struct";
import { useMarkToolbarButton, useMarkToolbarButtonState } from "platejs/react";
import type * as React from "react";
import { ToolbarButton } from "./toolbar";

export function MarkToolbarButton({
  clear,
  nodeType,
  ...props
}: React.ComponentProps<typeof ToolbarButton> & {
  readonly nodeType: string;
  readonly clear?: string[] | string | undefined;
}) {
  // TS2379: Argument of type
  // ExactResult<{
  //   clear: string | string[] | undefined;
  //   nodeType: string;
  // }>
  // is not assignable to parameter of type
  // {
  //   nodeType: string;
  //   clear?: string | string[];
  // }
  // with 'exactOptionalPropertyTypes: true'. Consider adding undefined to the types of the target's properties.
  // Types of property clear are incompatible.
  // Type string | string[] | undefined is not assignable to type string | string[]
  // Type undefined is not assignable to type string | string[]
  const state = useMarkToolbarButtonState(
    exact({
      clear,
      nodeType,
    })
  );
  const { props: buttonProps } = useMarkToolbarButton(state);

  return <ToolbarButton {...props} {...buttonProps} />;
}
