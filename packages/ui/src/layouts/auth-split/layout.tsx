"use client";

import { assetPaths } from "@beep/constants";
import { paths } from "@beep/shared-domain";
import { Logo } from "@beep/ui/branding";
import { RouterLink } from "@beep/ui/routing";
import { ObjectUtils } from "@beep/utils";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { Breakpoint } from "@mui/material/styles";
import { SettingsButton } from "../components/settings-button";
import type { HeaderSectionProps, LayoutSectionProps, MainSectionProps } from "../core";
import { HeaderSection, LayoutSection, MainSection } from "../core";
import type { AuthSplitContentProps } from "./content";
import { AuthSplitContent } from "./content";
import type { AuthSplitSectionProps } from "./section";
import { AuthSplitSection } from "./section";

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, "sx" | "children" | "cssVars">;

export type AuthSplitLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
    section?: AuthSplitSectionProps;
    content?: AuthSplitContentProps;
  };
};

export function AuthSplitLayout({ sx, cssVars, children, slotProps, layoutQuery = "md" }: AuthSplitLayoutProps) {
  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps["slotProps"] = {
      container: { maxWidth: false },
    };

    const headerSlots: HeaderSectionProps["slots"] = {
      topArea: (
        <Alert severity="info" sx={{ display: "none", borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Logo */}
          <Logo />
        </>
      ),
      rightArea: (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5 },
          }}
        >
          {/** @slot Help link */}
          <Link href={paths.faqs} component={RouterLink} color="inherit" sx={{ typography: "subtitle2" }}>
            Need help?
          </Link>

          {/** @slot Settings button */}
          <SettingsButton />
        </Box>
      ),
    };

    return (
      <HeaderSection
        disableElevation
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={ObjectUtils.deepMerge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={[
          { position: { [layoutQuery]: "fixed" } },
          ...(Array.isArray(slotProps?.header?.sx) ? slotProps.header.sx : [slotProps?.header?.sx]),
        ]}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => (
    <MainSection
      {...slotProps?.main}
      sx={[
        (theme) => ({
          [theme.breakpoints.up(layoutQuery)]: { flexDirection: "row" },
        }),
        ...(Array.isArray(slotProps?.main?.sx) ? slotProps.main.sx : [slotProps?.main?.sx]),
      ]}
    >
      <AuthSplitSection
        layoutQuery={layoutQuery}
        method={"Jwt"}
        {...slotProps?.section}
        methods={[
          {
            label: "Jwt",
            path: paths.auth.signIn,
            icon: assetPaths.assets.icons.platforms.icJwt,
          },
        ]}
      />
      <AuthSplitContent layoutQuery={layoutQuery} {...slotProps?.content}>
        {children}
      </AuthSplitContent>
    </MainSection>
  );

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
      cssVars={{ "--layout-auth-content-width": "420px", ...cssVars }}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}
