"use client";

import { Logo } from "@beep/ui/branding";
import { RecordUtils } from "@beep/utils/data";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import type { Breakpoint } from "@mui/material/styles";
import { SettingsButton } from "../components/settings-button";
import type { HeaderSectionProps, LayoutSectionProps, MainSectionProps } from "../core";
import { HeaderSection, LayoutSection, MainSection } from "../core";
import type { SimpleCompactContentProps } from "./content";
import { SimpleCompactContent } from "./content";

type LayoutBaseProps = Pick<LayoutSectionProps, "sx" | "children" | "cssVars">;

export type SimpleLayoutProps = LayoutBaseProps & {
  readonly layoutQuery?: Breakpoint | undefined;
  readonly slotProps?: {
    readonly header?: HeaderSectionProps | undefined;
    readonly main?: MainSectionProps | undefined;
    readonly content?: (SimpleCompactContentProps & { readonly compact?: boolean | undefined }) | undefined;
  };
};

export function SimpleLayout({ sx, cssVars, children, slotProps, layoutQuery = "md" }: SimpleLayoutProps) {
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
      leftArea: <Logo />,
      rightArea: (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5 },
          }}
        >
          {/** @slot Settings button */}
          <SettingsButton />
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={RecordUtils.merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx ?? {}}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => {
    const { compact, ...restContentProps } = slotProps?.content ?? {};

    return (
      <MainSection {...slotProps?.main}>
        {compact ? (
          <SimpleCompactContent layoutQuery={layoutQuery} {...restContentProps}>
            {children}
          </SimpleCompactContent>
        ) : (
          children
        )}
      </MainSection>
    );
  };

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
      cssVars={{ "--layout-simple-content-compact-width": "448px", ...cssVars }}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}
