"use client";
import { Logo } from "@beep/ui/branding";
import { useBoolean } from "@beep/ui/hooks";
import { useAuthAdapterProvider } from "@beep/ui/providers";
import type { NavItemProps, NavSectionProps } from "@beep/ui/routing";
import { useSettingsContext } from "@beep/ui/settings";
import { allLangs } from "@beep/ui-core/i18n";
import { ObjectUtils } from "@beep/utils";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { iconButtonClasses } from "@mui/material/IconButton";
import type { Breakpoint } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { Iconify } from "../../atoms";
import { AccountDrawer } from "../components/account-drawer";
import { ContactsPopover } from "../components/contacts-popover";
import { LanguagePopover } from "../components/language-popover";
import { MenuButton } from "../components/menu-button";
import { NotificationsDrawer } from "../components/notifications-drawer";
import { Searchbar } from "../components/searchbar";
import { SettingsButton } from "../components/settings-button";
import { WorkspacesPopover } from "../components/workspaces-popover";
import type { HeaderSectionProps, LayoutSectionProps, MainSectionProps } from "../core";
import { HeaderSection, LayoutSection, layoutClasses, MainSection } from "../core";
import { navData as dashboardNavData } from "../nav-config-dashboard";
import { _workspaces } from "../nav-config-workspace";
import { VerticalDivider } from "./content";
import { dashboardLayoutVars, dashboardNavColorVars } from "./css-vars";
import { NavHorizontal } from "./nav-horizontal";
import { NavMobile } from "./nav-mobile";
import { NavVertical } from "./nav-vertical";

type LayoutBaseProps = Pick<LayoutSectionProps, "sx" | "children" | "cssVars">;

export type DashboardLayoutProps = LayoutBaseProps & {
  readonly layoutQuery?: Breakpoint | undefined;
  readonly onClickAccountSettings: () => void;
  readonly slotProps?:
    | {
        readonly header?: HeaderSectionProps | undefined;
        readonly nav?:
          | {
              readonly data?: NavSectionProps["data"] | undefined;
            }
          | undefined;
        readonly main?: MainSectionProps | undefined;
      }
    | undefined;
};

export function DashboardLayout({
  onClickAccountSettings,
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = "lg",
}: DashboardLayoutProps) {
  const theme = useTheme();

  const {
    session: { user },
    notifications,
    contacts,
  } = useAuthAdapterProvider();

  const settings = useSettingsContext();

  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const navData = slotProps?.nav?.data ?? dashboardNavData;

  const isNavMini = settings.state.navLayout === "mini";
  const isNavHorizontal = settings.state.navLayout === "horizontal";
  const isNavVertical = isNavMini || settings.state.navLayout === "vertical";

  const canDisplayItemByRole = (allowedRoles: NavItemProps["allowedRoles"]): boolean =>
    !allowedRoles?.includes(user?.role);

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps["slotProps"] = {
      container: {
        maxWidth: false,
        sx: {
          ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
          ...(isNavHorizontal && {
            bgcolor: "var(--layout-nav-bg)",
            height: { [layoutQuery]: "var(--layout-nav-horizontal-height)" },
            [`& .${iconButtonClasses.root}`]: {
              color: "var(--layout-nav-text-secondary-color)",
            },
          }),
        },
      },
    };

    const headerSlots: HeaderSectionProps["slots"] = {
      topArea: (
        <Alert severity="info" sx={{ display: "none", borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      bottomArea: isNavHorizontal ? (
        <NavHorizontal
          data={navData}
          layoutQuery={layoutQuery}
          {...(navVars.section
            ? { cssVars: navVars.section as React.ComponentProps<typeof NavHorizontal>["cssVars"] }
            : {})}
          checkPermissions={canDisplayItemByRole}
        />
      ) : null,
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{
              mr: 1,
              ml: -1,
              [theme.breakpoints.up(layoutQuery)]: { display: "none" },
            }}
          />
          <NavMobile
            data={navData}
            open={open}
            onClose={onClose}
            cssVars={navVars.section as React.ComponentProps<typeof NavMobile>["cssVars"]}
            checkPermissions={canDisplayItemByRole}
          />

          {/** @slot Logo */}
          {isNavHorizontal && (
            <Logo
              sx={{
                display: "none",
                [theme.breakpoints.up(layoutQuery)]: { display: "inline-flex" },
              }}
            />
          )}

          {/** @slot Divider */}
          {isNavHorizontal && <VerticalDivider sx={{ [theme.breakpoints.up(layoutQuery)]: { display: "flex" } }} />}

          {/** @slot Workspace popover */}
          <WorkspacesPopover
            data={_workspaces}
            sx={{
              ...(isNavHorizontal && {
                color: "var(--layout-nav-text-primary-color)",
              }),
            }}
          />
        </>
      ),
      rightArea: (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0, sm: 0.75 },
          }}
        >
          {/** @slot Searchbar */}
          <Searchbar data={navData} />

          {/** @slot Language popover */}
          <LanguagePopover data={allLangs} />

          {/** @slot Notifications popover */}
          <NotificationsDrawer data={[...notifications]} />

          {/** @slot Contacts popover */}
          <ContactsPopover data={[...contacts]} />

          {/** @slot Settings button */}
          <SettingsButton />

          {/** @slot Account drawer */}
          <AccountDrawer
            data={[
              {
                label: "Home",
                href: "/",
                icon: <Iconify icon="solar:home-angle-bold-duotone" />,
              },
              {
                label: "Profile",
                href: "#",
                icon: <Iconify icon="custom:profile-duotone" />,
              },
              {
                label: "Projects",
                href: "#",
                icon: <Iconify icon="solar:notes-bold-duotone" />,
                info: "3",
              },
              {
                label: "Subscription",
                href: "#",
                icon: <Iconify icon="custom:invoice-duotone" />,
              },
              {
                label: "Security",
                href: "#",
                icon: <Iconify icon="solar:shield-keyhole-bold-duotone" />,
              },
              {
                label: "Account settings",
                href: "#",
                onClick: () => onClickAccountSettings(),
                icon: <Iconify icon="solar:settings-bold-duotone" />,
              },
            ]}
          />
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        disableElevation={isNavVertical}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots } as React.ComponentProps<typeof HeaderSection>["slots"]}
        slotProps={
          ObjectUtils.deepMerge(headerSlotProps, slotProps?.header?.slotProps ?? {}) as React.ComponentProps<
            typeof HeaderSection
          >["slotProps"]
        }
        sx={slotProps?.header?.sx ?? {}}
      />
    );
  };

  const renderSidebar = () => (
    <NavVertical
      data={navData}
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      cssVars={navVars.section as React.ComponentProps<typeof NavVertical>["cssVars"]}
      checkPermissions={canDisplayItemByRole}
      onToggleNav={() => settings.setField("navLayout", settings.state.navLayout === "vertical" ? "mini" : "vertical")}
    />
  );

  const renderFooter = () => null;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Sidebar
       *************************************** */
      sidebarSection={isNavHorizontal ? null : renderSidebar()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...dashboardLayoutVars(theme), ...navVars.layout, ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: isNavMini ? "var(--layout-nav-mini-width)" : "var(--layout-nav-vertical-width)",
              transition: theme.transitions.create(["padding-left"], {
                easing: "var(--layout-transition-easing)",
                duration: "var(--layout-transition-duration)",
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}
