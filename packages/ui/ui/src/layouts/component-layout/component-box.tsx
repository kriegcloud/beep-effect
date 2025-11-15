import { rgbaFromChannel } from "@beep/ui-core/utils";

import { styled } from "@mui/material/styles";

// ----------------------------------------------------------------------

type ComponentBoxProps = React.ComponentProps<typeof Root> & {
  readonly title?: string | undefined;
};

export function ComponentBox({ sx, title, children, ...other }: ComponentBoxProps) {
  return (
    <Root>
      {title && <Title>{title}</Title>}
      <Content sx={sx ?? {}} {...other}>
        {children}
      </Content>
    </Root>
  );
}

// ----------------------------------------------------------------------

const Root = styled("div")(({ theme }) => ({
  minWidth: 0, // Prevents the box from overflowing its container
  width: "100%",
  position: "relative",
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.04),
  boxShadow: `0 0 0 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.16)}`,
}));

const Content = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexWrap: "wrap",
  position: "relative",
  alignItems: "center",
  borderRadius: "inherit",
  justifyContent: "center",
  rowGap: theme.spacing(3),
  columnGap: theme.spacing(2),
  padding: theme.spacing(6, 3),
}));

const Title = styled("span")(({ theme }) => ({
  top: 0,
  left: 0,
  zIndex: 1,
  position: "absolute",
  display: "inline-flex",
  marginLeft: theme.spacing(2.5),
  padding: theme.spacing(0.25, 1),
  color: theme.vars.palette.text.primary,
  borderRadius: Number(theme.shape.borderRadius) * 2,
  backgroundColor: theme.vars.palette.common.white,
  transform: "translateY(-50%)",
  fontSize: theme.typography.caption.fontSize,
  fontWeight: theme.typography.fontWeightSemiBold,
  border: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.24)}`,
  ...theme.applyStyles("dark", {
    backgroundColor: theme.vars.palette.background.neutral,
  }),
}));

// ----------------------------------------------------------------------

export const contentStyles = {
  grid: (col = 2) => ({
    rowGap: 5,
    columnGap: 3,
    display: "grid",
    gridTemplateColumns: { xs: "repeat(1, 1fr)", md: `repeat(${col}, 1fr)` },
  }),
  column: (gap = 5) => ({
    gap,
    display: "flex",
    flexDirection: "column",
  }),
  row: (gap = 2) => ({
    gap,
    width: 1,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  }),
} as const;
