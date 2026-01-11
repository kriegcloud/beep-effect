import { AccountSettingsTabSearchParamValue } from "@beep/iam-domain";
import { Iconify } from "@beep/ui/atoms/iconify/iconify";
import { SimpleBar } from "@beep/ui/molecules";
import { useBreakpoints } from "@beep/ui/providers/break-points.provider";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Slide from "@mui/material/Slide";
import Tab from "@mui/material/Tab";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { TransitionProps } from "@mui/material/transitions";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import React from "react";
import { GeneralTabPanel } from "@/features/account/general/GeneralTabPanel";
import { LocalizationTabPanel } from "@/features/account/localization/LocalizationTabPanel";
import { SecurityTabPanel } from "@/features/account/security/SecurityTabPanel";
import { AccountNotificationsView } from "@/features/account/view";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
type AccountTabItem = {
  readonly slug: AccountSettingsTabSearchParamValue.Type;
  readonly label: string;
  readonly icon: React.ReactElement;
  readonly onClick: () => void;
  readonly render: () => React.ReactNode;
};

const NAV_ITEMS = (handleTab: (tab: AccountSettingsTabSearchParamValue.Type) => void): ReadonlyArray<AccountTabItem> =>
  [
    {
      slug: AccountSettingsTabSearchParamValue.Enum.general,
      label: "General",
      icon: <Iconify width={24} icon="solar:user-id-bold" />,
      onClick: () => handleTab(AccountSettingsTabSearchParamValue.Enum.general),
      render: () => <GeneralTabPanel />,
    },
    {
      slug: AccountSettingsTabSearchParamValue.Enum.notifications,
      label: "Notifications",
      icon: <Iconify width={24} icon="solar:bell-bing-bold" />,
      onClick: () => handleTab(AccountSettingsTabSearchParamValue.Enum.notifications),
      render: () => <AccountNotificationsView />,
    },
    {
      slug: AccountSettingsTabSearchParamValue.Enum.security,
      label: "Security",
      icon: <Iconify width={24} icon="ic:round-vpn-key" />,
      onClick: () => handleTab(AccountSettingsTabSearchParamValue.Enum.security),
      render: () => <SecurityTabPanel />,
    },
    {
      slug: AccountSettingsTabSearchParamValue.Enum.localization,
      label: "Localization",
      icon: <Iconify width={24} icon={"material-symbols:public"} />,
      onClick: () => handleTab(AccountSettingsTabSearchParamValue.Enum.localization),
      render: () => <LocalizationTabPanel />,
    },
  ] as const;

interface TabPanelProps {
  readonly children: React.ReactNode;
  readonly value: string;
  readonly activeValue: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, activeValue, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={activeValue !== value}
      id={`account-settings-tabpanel-${value}`}
      aria-labelledby={`account-settings-tab-${value}`}
      {...other}
    >
      {activeValue === value && (
        <Box sx={{ p: 3, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(slug: string) {
  return {
    id: `account-settings-tab-${slug}`,
    "aria-controls": `account-settings-tabpanel-${slug}`,
  };
}

const NAV_PANEL_WIDTH = 256;

function AccountTabs({
  handleTab,
  currentTab,
}: {
  readonly handleTab: (currentTab: AccountSettingsTabSearchParamValue.Type) => void;
  readonly currentTab: AccountSettingsTabSearchParamValue.Type;
}) {
  const breakpoints = useBreakpoints();
  const isMobile = breakpoints.down("md");
  const isXs = breakpoints.down("xs");
  const tabIconPosition = isMobile ? "top" : "start";

  const navItems = React.useMemo(() => NAV_ITEMS(handleTab), [handleTab]);

  return (
    <Box
      sx={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "background.default",
        height: "100%",
        overflowX: "hidden",
        pl: { md: `${NAV_PANEL_WIDTH}px` },
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          position: { xs: "relative", md: "absolute" },
          top: { md: 0 },
          bottom: { md: 0 },
          left: { md: 0 },
          width: { xs: "100%", md: NAV_PANEL_WIDTH },
          bgcolor: "background.paper",
          zIndex: 1,
        }}
      >
        <Tabs
          orientation={isMobile ? "horizontal" : "vertical"}
          scrollButtons
          allowScrollButtonsMobile
          value={currentTab}
          aria-label="Account settings sections"
          variant={"fullWidth"}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            width: "100%",
            px: 0,
            height: { xs: "auto", md: "100%" },
            [`& .${tabsClasses.list}`]: {
              gap: 0,
              ...(isMobile
                ? {
                    width: "100%",
                    justifyContent: isXs ? "flex-start" : "center",
                  }
                : {}),
            },
            ...(isMobile
              ? {
                  [`& .${tabsClasses.scroller}`]: {
                    width: "100%",
                  },
                }
              : {}),
            "& .MuiTabs-indicator": {
              ...(isMobile
                ? {
                    bottom: 0,
                    height: 4,
                    borderRadius: 0,
                  }
                : {
                    left: 0,
                    width: 4,
                  }),
            },
            "& .MuiTab-root": {
              alignItems: "center",
              paddingLeft: {
                xs: 0,
                md: 2,
              },
              paddingRight: {
                xs: 0,
                md: 2,
              },
              justifyContent: {
                xs: "center",
                md: "flex-start",
              },
              minHeight: 56,
              ...(isMobile && !isXs
                ? {
                    flex: 1,
                    minWidth: 0,
                    maxWidth: "none",
                  }
                : {}),
              ...(isXs
                ? {
                    minWidth: 128,
                  }
                : {}),
            },
          }}
        >
          {F.pipe(
            navItems,
            A.map((tab) => (
              <Tab
                key={tab.slug}
                onClick={tab.onClick}
                label={
                  <Typography
                    sx={{
                      display: {
                        md: "block",
                        sm: "block",
                        xs: "none",
                      },
                      maxWidth: "100%",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    variant={"body2"}
                    noWrap
                  >
                    {tab.label}
                  </Typography>
                }
                icon={tab.icon}
                value={tab.slug}
                iconPosition={tabIconPosition}
                {...a11yProps(tab.slug)}
                sx={(theme) => ({
                  justifyContent: {
                    xs: "center",
                    md: "flex-start",
                  },
                  alignItems: "center",
                  textAlign: {
                    xs: "center",
                    md: "left",
                  },
                  color: theme.palette.text.secondary,
                  gap: {
                    xs: theme.spacing(1),
                    md: theme.spacing(1.5),
                  },
                  "& .MuiTab-label": {
                    color: theme.palette.text.secondary,
                    width: "100%",
                    display: "block",
                  },
                  "& .MuiTab-iconWrapper": {
                    marginBottom: {
                      xs: 0,
                      md: 0,
                    },
                    marginRight: {
                      xs: 0,
                      md: 0,
                    },
                  },
                  "& .MuiTab-iconWrapper > *": {
                    color: theme.palette.text.secondary,
                  },
                  "&.Mui-selected": {
                    color: theme.palette.primary.main,
                    "& .MuiTab-label": {
                      color: theme.palette.primary.main,
                    },
                    "& .MuiTab-iconWrapper > *": {
                      color: theme.palette.primary.main,
                    },
                  },
                })}
              />
            ))
          )}
        </Tabs>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          mt: { xs: 2, md: 0 },
          px: { xs: 2, md: 3 },
          boxSizing: "border-box",
        }}
      >
        <SimpleBar sx={{ height: "100%" }}>
          {F.pipe(
            navItems,
            A.map((tab) => (
              <TabPanel key={tab.slug} value={tab.slug} activeValue={currentTab}>
                {tab.render()}
              </TabPanel>
            ))
          )}
        </SimpleBar>
      </Box>
    </Box>
  );
}

type AccountDialogProps = {
  readonly onClose: () => void;
  readonly handleTab: (tab: AccountSettingsTabSearchParamValue.Type) => void;
  readonly currentTab: O.Option<AccountSettingsTabSearchParamValue.Type>;
};
export const AccountDialog = (props: AccountDialogProps) => {
  return (
    <Dialog
      open={O.isSome(props.currentTab)}
      onClose={props.onClose}
      maxWidth={"md"}
      fullWidth={true}
      fullScreen={true}
      disableRestoreFocus
      slots={{
        transition: Transition,
      }}
      slotProps={{
        paper: {
          sx: {
            display: "flex",
            flexDirection: "column",
            overflowX: "hidden",
          },
        },
      }}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar sx={{ backgroundColor: "background.default" }}>
          <IconButton edge="start" color="inherit" onClick={props.onClose} aria-label="close">
            <Iconify icon={"carbon:close"} />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Account Settings
          </Typography>
        </Toolbar>
      </AppBar>
      {O.isSome(props.currentTab) ? (
        <AccountTabs currentTab={props.currentTab.value} handleTab={props.handleTab} />
      ) : null}
    </Dialog>
  );
};
