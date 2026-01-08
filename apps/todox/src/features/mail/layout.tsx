import type { SxProps, Theme } from "@mui/material/styles";

import { styled } from "@mui/material/styles";

// ----------------------------------------------------------------------

type MailLayoutProps = React.ComponentProps<"div"> & {
  sx?: SxProps<Theme>;
  slots: {
    nav: React.ReactNode;
    list: React.ReactNode;
    header: React.ReactNode;
    details: React.ReactNode;
  };
  slotProps?: {
    nav?: React.ComponentProps<typeof LayoutNav>;
    list?: React.ComponentProps<typeof LayoutList>;
    details?: React.ComponentProps<typeof LayoutDetails>;
    container?: React.ComponentProps<typeof LayoutContainer>;
  };
};

export function MailLayout({ slots, slotProps, sx, ...other }: MailLayoutProps) {
  return (
    <LayoutRoot sx={sx} {...other}>
      {slots.header}

      <LayoutContainer {...slotProps?.container}>
        <LayoutNav {...slotProps?.nav}>{slots.nav}</LayoutNav>
        <LayoutList {...slotProps?.list}>{slots.list}</LayoutList>
        <LayoutDetails {...slotProps?.details}>{slots.details}</LayoutDetails>
      </LayoutContainer>
    </LayoutRoot>
  );
}

// ----------------------------------------------------------------------

const LayoutRoot = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
}));

const LayoutContainer = styled("div")(({ theme }) => ({
  gap: theme.spacing(1),
  display: "flex",
  flex: "1 1 auto",
  overflow: "hidden",
}));

const LayoutNav = styled("div")(({ theme }) => ({
  display: "none",
  flex: "0 0 200px",
  overflow: "hidden",
  flexDirection: "column",
  [theme.breakpoints.up("md")]: { display: "flex" },
}));

const LayoutList = styled("div")(({ theme }) => ({
  display: "none",
  flex: "0 0 320px",
  overflow: "hidden",
  flexDirection: "column",
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.vars.palette.background.default,
  [theme.breakpoints.up("md")]: { display: "flex" },
}));

const LayoutDetails = styled("div")(({ theme }) => ({
  minWidth: 0,
  display: "flex",
  flex: "1 1 auto",
  overflow: "hidden",
  flexDirection: "column",
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.vars.palette.background.default,
}));
