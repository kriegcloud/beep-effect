import type { SxProps, Theme } from "@mui/material/styles";

import { styled } from "@mui/material/styles";

// ----------------------------------------------------------------------

type MailLayoutProps = React.ComponentProps<"div"> & {
  readonly sx?: undefined | SxProps<Theme>;
  readonly slots: {
    readonly nav: React.ReactNode;
    readonly list: React.ReactNode;
    readonly header: React.ReactNode;
    readonly details: React.ReactNode;
  };
  readonly slotProps?:
    | undefined
    | {
        readonly nav?: undefined | React.ComponentProps<typeof LayoutNav>;
        readonly list?: undefined | React.ComponentProps<typeof LayoutList>;
        readonly details?: undefined | React.ComponentProps<typeof LayoutDetails>;
        readonly container?: undefined | React.ComponentProps<typeof LayoutContainer>;
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
