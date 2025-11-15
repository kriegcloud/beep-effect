"use client";

import { Logo } from "@beep/ui/branding";
import { useBoolean, usePathname } from "@beep/ui/hooks";
// import { paths } from "@beep/shared-domain";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
import type { Breakpoint } from "@mui/material/styles";
import { MenuButton } from "../components/menu-button";
import { SettingsButton } from "../components/settings-button";
import { SignInButton } from "../components/sign-in-button";
import type { HeaderSectionProps, LayoutSectionProps, MainSectionProps } from "../core";
import { HeaderSection, LayoutSection, MainSection } from "../core";
import { navData as mainNavData } from "../nav-config-main";
import type { FooterProps } from "./footer";
import { Footer, HomeFooter } from "./footer";
import { NavDesktop } from "./nav/desktop";
import { NavMobile } from "./nav/mobile";
import type { NavMainProps } from "./nav/types";

type LayoutBaseProps = Pick<LayoutSectionProps, "sx" | "children" | "cssVars">;

export type MainLayoutProps = LayoutBaseProps & {
  readonly layoutQuery?: Breakpoint | undefined;
  readonly slotProps?:
    | {
        readonly header?: HeaderSectionProps | undefined;
        readonly nav?:
          | {
              readonly data?: NavMainProps["data"] | undefined;
            }
          | undefined;
        readonly main?: MainSectionProps | undefined;
        readonly footer?: FooterProps | undefined;
      }
    | undefined;
};

export function MainLayout({ sx, cssVars, children, slotProps, layoutQuery = "md" }: MainLayoutProps) {
  const pathname = usePathname();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const isHomePage = pathname === "/";

  const navData = slotProps?.nav?.data ?? mainNavData;

  const renderHeader = () => {
    const headerSlots: HeaderSectionProps["slots"] = {
      topArea: (
        <Alert severity="info" sx={{ display: "none", borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={(theme) => ({
              mr: 1,
              ml: -1,
              [theme.breakpoints.up(layoutQuery)]: { display: "none" },
            })}
          />
          <NavMobile data={navData} open={open} onClose={onClose} />

          {/** @slot Logo */}
          <Logo />
        </>
      ),
      rightArea: (
        <>
          {/** @slot Nav desktop */}
          <NavDesktop
            data={navData}
            sx={(theme) => ({
              display: "none",
              [theme.breakpoints.up(layoutQuery)]: { mr: 2.5, display: "flex" },
            })}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            {/** @slot Settings button */}
            <SettingsButton />

            {/** @slot Sign in button */}
            <SignInButton />

            {/** @slot Purchase button */}
            {/*<Button*/}
            {/*  variant="contained"*/}
            {/*  rel="noopener noreferrer"*/}
            {/*  target="_blank"*/}
            {/*  href={paths.minimalStore}*/}
            {/*  sx={(theme) => ({*/}
            {/*    display: "none",*/}
            {/*    [theme.breakpoints.up(layoutQuery)]: { display: "inline-flex" },*/}
            {/*  })}*/}
            {/*>*/}
            {/*  Purchase*/}
            {/*</Button>*/}
          </Box>
        </>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={slotProps?.header?.slotProps}
        sx={slotProps?.header?.sx ?? {}}
      />
    );
  };

  const renderFooter = () =>
    isHomePage ? (
      <HomeFooter sx={slotProps?.footer?.sx ?? {}} />
    ) : (
      <Footer sx={slotProps?.footer?.sx ?? {}} layoutQuery={layoutQuery} />
    );

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={cssVars}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}
