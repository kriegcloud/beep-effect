/**
 * MUI Treasury action bar primitives installed into the editor app.
 *
 * @module
 * @since 0.0.0
 */
"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { type ComponentProps, type CSSProperties, memo } from "react";

/**
 * Props accepted by the action bar container.
 *
 * @example
 * ```tsx
 * import type { ActionsProps } from "@beep/editor-app/mui-treasury/components/ai-actions"
 *
 * const props: ActionsProps = {
 *   style: { gap: 8 },
 * }
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ActionsProps = Omit<ComponentProps<typeof Box>, "sx"> & {
  readonly style?: undefined | CSSProperties;
};

/**
 * Render a horizontal action bar.
 *
 * @example
 * ```tsx
 * import { Actions } from "@beep/editor-app/mui-treasury/components/ai-actions"
 *
 * const Toolbar = () => <Actions />
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const Actions = ({ children, style, ...props }: ActionsProps) => (
  <Box
    style={{
      display: "flex",
      alignItems: "center",
      gap: "4px",
      ...style,
    }}
    {...props}
  >
    {children}
  </Box>
);

/**
 * Props accepted by an individual action button.
 *
 * @example
 * ```tsx
 * import type { ActionProps } from "@beep/editor-app/mui-treasury/components/ai-actions"
 *
 * const props: ActionProps = {
 *   label: "Generate",
 *   tooltip: "Generate",
 * }
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ActionProps = ComponentProps<typeof IconButton> & {
  readonly tooltip?: undefined | string;
  readonly label?: undefined | string;
  readonly style?: undefined | CSSProperties;
};

/**
 * Render a tooltip-aware icon action button.
 *
 * @example
 * ```tsx
 * import { Action } from "@beep/editor-app/mui-treasury/components/ai-actions"
 *
 * const Button = () => <Action label="Generate" />
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const Action = memo(({ tooltip, children, label, size = "small", style, ...props }: ActionProps) => {
  const resolvedLabel = label ?? tooltip;
  const button = (
    <IconButton
      size={size}
      type="button"
      style={{
        position: "relative",
        width: 36,
        height: 36,
        padding: 6,
        color: "inherit",
        ...style,
      }}
      aria-label={resolvedLabel}
      {...props}
    >
      {children}
    </IconButton>
  );

  if (tooltip !== undefined && tooltip !== "") {
    return (
      <Tooltip title={tooltip} arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
});

Action.displayName = "Action";
