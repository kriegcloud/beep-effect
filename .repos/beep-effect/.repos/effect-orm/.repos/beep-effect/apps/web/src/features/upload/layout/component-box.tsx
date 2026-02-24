import { rgbaFromChannel } from "@beep/ui-core/utils";

import { styled } from "@mui/material/styles";
import type React from "react";

type ComponentBoxProps = React.ComponentProps<typeof ComponentBoxRoot> & {
  readonly title?: string | undefined;
};

export function ComponentBox({ title, sx, children, ...other }: ComponentBoxProps) {
  return (
    <ComponentBoxRoot sx={sx} {...other}>
      {title && <ComponentBoxLabel>{title}</ComponentBoxLabel>}
      {children}
    </ComponentBoxRoot>
  );
}

const ComponentBoxRoot = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexWrap: "wrap",
  position: "relative",
  alignItems: "center",
  rowGap: theme.spacing(3),
  columnGap: theme.spacing(2),
  justifyContent: "center",
  padding: theme.spacing(6, 3),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: rgbaFromChannel(theme.vars?.palette.grey["500Channel"], 0.04),
  boxShadow: `0 0 0 1px ${rgbaFromChannel(theme.vars?.palette.grey["500Channel"], 0.16)}`,
}));

const ComponentBoxLabel = styled("span")(({ theme }) => ({
  top: 0,
  left: 0,
  position: "absolute",
  marginLeft: theme.spacing(2.5),
  padding: theme.spacing(0.25, 1),
  color: theme.vars?.palette.text.primary,
  borderRadius: Number(theme.shape.borderRadius) * 2,
  backgroundColor: theme.vars?.palette.common.white,
  transform: "translateY(-50%)",
  fontSize: theme.typography.caption.fontSize,
  fontWeight: theme.typography.fontWeightSemiBold,
  border: `solid 1px ${rgbaFromChannel(theme.vars?.palette.grey["500Channel"], 0.24)}`,
  ...theme.applyStyles("dark", {
    backgroundColor: theme.vars?.palette.background.neutral,
  }),
}));
