import { Tabs as MuiTabs } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import { tabClasses } from "@mui/material/Tab";
import type { TabsProps } from "@mui/material/Tabs";
import type React from "react";
import { useIsClient } from "../../hooks";

type CustomTabsSlotProps = TabsProps["slotProps"] & {
  readonly tab?: { readonly sx?: SxProps<Theme> | undefined } | undefined;
  readonly list?: { readonly sx?: SxProps<Theme> | undefined } | undefined;
  readonly indicator?: { readonly sx?: SxProps<Theme> | undefined } | undefined;
  readonly indicatorContent?: React.ComponentProps<typeof IndicatorContent> | undefined;
};

export type CustomTabsProps = TabsProps & {
  readonly slotProps?: CustomTabsSlotProps | undefined;
};

const customTabsStyles: Record<string, SxProps<Theme>> = {
  root: {
    flexShrink: 0,
    bgcolor: "background.neutral",
  },
  list: {
    p: 1,
    height: 1,
    gap: { xs: 0 },
  },
  indicator: {
    py: 1,
    height: 1,
    bgcolor: "transparent",
  },
  tabItem: {
    px: 2,
    zIndex: 1,
    minHeight: "auto",
  },
};

export function Tabs({ children, slotProps, sx, ...other }: CustomTabsProps) {
  const isClient = useIsClient();

  return (
    <MuiTabs
      sx={[
        customTabsStyles.root,
        {
          [`& .${tabClasses.root}`]: {
            ...customTabsStyles.tabItem,
            ...slotProps?.tab?.sx,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      slotProps={{
        ...slotProps,
        indicator: {
          ...slotProps?.indicator,
          children: isClient && (
            <IndicatorContent {...(slotProps?.indicatorContent?.sx ? { sx: slotProps?.indicatorContent?.sx } : {})} />
          ),
          sx: [
            customTabsStyles.indicator,
            ...(Array.isArray(slotProps?.indicator?.sx) ? slotProps.indicator.sx : [slotProps?.indicator?.sx]),
          ],
        },
        list: {
          ...slotProps?.list,
          sx: [
            customTabsStyles.list,
            ...(Array.isArray(slotProps?.list?.sx) ? slotProps.list.sx : [slotProps?.list?.sx]),
          ],
        },
      }}
      {...other}
    >
      {children}
    </MuiTabs>
  );
}

const IndicatorContent = styled("span")(({ theme }) => ({
  zIndex: 1,
  width: "100%",
  height: "100%",
  display: "block",
  borderRadius: Number(theme.shape.borderRadius),
  boxShadow: theme.vars.customShadows.z1,
  backgroundColor: theme.vars.palette.common.white,
  ...theme.applyStyles("dark", {
    backgroundColor: theme.vars.palette.grey["900"],
  }),
}));
