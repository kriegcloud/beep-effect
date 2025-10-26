import { paths } from "@beep/shared-domain";
import { Iconify } from "@beep/ui/atoms/iconify/iconify";
import { useSearchParams } from "@beep/ui/hooks";
import { SimpleBar } from "@beep/ui/molecules";
import { useBreakpoints } from "@beep/ui/providers/break-points.provider";
import { RouterLink } from "@beep/ui/routing";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Slide from "@mui/material/Slide";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { TransitionProps } from "@mui/material/transitions";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import React from "react";
import {
  AccountBillingView,
  AccountGeneralView,
  AccountNotificationsView,
  AccountSecurityView,
  AccountSocialsView,
} from "@/features/account/view";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
type AccountTabItem = {
  readonly slug: string;
  readonly label: string;
  readonly icon: React.ReactElement;
  readonly href: string;
  readonly render: () => React.ReactNode;
};

const NAV_ITEMS: ReadonlyArray<AccountTabItem> = [
  {
    slug: "general",
    label: "General",
    icon: <Iconify width={24} icon="solar:user-id-bold" />,
    href: paths.dashboard.user.accountSettings("general"),
    render: () => <AccountGeneralView />,
  },
  {
    slug: "billing",
    label: "Billing",
    icon: <Iconify width={24} icon="solar:bill-list-bold" />,
    href: paths.dashboard.user.accountSettings("billing"),
    render: () => <AccountBillingView />,
  },
  {
    slug: "notifications",
    label: "Notifications",
    icon: <Iconify width={24} icon="solar:bell-bing-bold" />,
    href: paths.dashboard.user.accountSettings("notifications"),
    render: () => <AccountNotificationsView />,
  },
  {
    slug: "socials",
    label: "Social links",
    icon: <Iconify width={24} icon="solar:share-bold" />,
    href: paths.dashboard.user.accountSettings("socials"),
    render: () => <AccountSocialsView />,
  },
  {
    slug: "security",
    label: "Security",
    icon: <Iconify width={24} icon="ic:round-vpn-key" />,
    href: paths.dashboard.user.accountSettings("security"),
    render: () => <AccountSecurityView />,
  },
];

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

const DEFAULT_TAB_SLUG = F.pipe(
  NAV_ITEMS,
  A.head,
  O.map((item) => item.slug),
  O.getOrElse(() => "general")
);

const NAV_PANEL_WIDTH = 256;

function AccountTabs() {
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(DEFAULT_TAB_SLUG);

  React.useEffect(() => {
    const nextValue = F.pipe(
      O.fromNullable(searchParams.get("settingsTab")),
      O.flatMap((candidate) =>
        F.pipe(
          NAV_ITEMS,
          A.findFirst((tab) => tab.slug === candidate),
          O.map(() => candidate)
        )
      ),
      O.getOrElse(() => DEFAULT_TAB_SLUG)
    );

    setValue((current) => (current === nextValue ? current : nextValue));
  }, [searchParams]);

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const breakpoints = useBreakpoints();
  const isMobile = breakpoints.down("md");
  const tabIconPosition = isMobile ? "top" : "start";

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
          variant={breakpoints.currentBreakpoint === "xs" ? "scrollable" : "standard"}
          value={value}
          onChange={handleChange}
          aria-label="Account settings sections"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            height: { xs: "auto", md: "100%" },
            "& .MuiTabs-indicator": {
              left: 0,
              width: 4,
            },
            "& .MuiTab-root": {
              alignItems: "center",
              paddingLeft: {
                xs: 0,
                md: 2,
              },
              justifyContent: {
                xs: "center",
                md: "flex-start",
              },
              minHeight: 56,
            },
          }}
        >
          {F.pipe(
            NAV_ITEMS,
            A.map((tab) => (
              <Tab
                component={RouterLink}
                key={tab.slug}
                label={tab.label}
                icon={tab.icon}
                value={tab.slug}
                href={tab.href}
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
                  typography: "body2",
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
            NAV_ITEMS,
            A.map((tab) => (
              <TabPanel key={tab.slug} value={tab.slug} activeValue={value}>
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
  readonly open: boolean;
  readonly onClose: () => void;
};
export const AccountDialog = (props: AccountDialogProps) => {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      maxWidth={"md"}
      fullWidth={true}
      fullScreen={true}
      slots={{
        transition: Transition,
      }}
      slotProps={{
        paper: {
          sx: {
            height: { xs: "100dvh", md: 680 },
            maxHeight: { xs: "100dvh", md: 720 },
            display: "flex",
            flexDirection: "column",
            overflowX: "hidden",
          },
        },
      }}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar sx={{ backgroundColor: "background.default" }}>
          <IconButton edge="start" color="inherit" onClick={() => props.onClose()} aria-label="close">
            <Iconify icon={"carbon:close"} />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Account Settings
          </Typography>
        </Toolbar>
      </AppBar>
      <AccountTabs />
    </Dialog>
  );
};
