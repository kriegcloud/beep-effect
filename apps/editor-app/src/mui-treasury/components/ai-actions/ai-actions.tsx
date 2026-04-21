"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { type ComponentProps, type CSSProperties, memo } from "react";

export type ActionsProps = Omit<ComponentProps<typeof Box>, "sx"> & {
  readonly style?: undefined | CSSProperties;
};

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

export type ActionProps = ComponentProps<typeof IconButton> & {
  readonly tooltip?: undefined | string;
  readonly label?: undefined | string;
  readonly style?: undefined | CSSProperties;
};

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
