"use client";

import { mergeClasses } from "@beep/ui-core/utils";
import GlobalStyles from "@mui/material/GlobalStyles";
import type { CSSObject, SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

import { layoutClasses } from "./classes";
import { layoutSectionVars } from "./css-vars";

export type LayoutSectionProps = React.ComponentProps<"div"> & {
  readonly sx?: SxProps<Theme> | undefined;
  readonly cssVars?: CSSObject | undefined;
  readonly children?: React.ReactNode | undefined;
  readonly footerSection?: React.ReactNode | undefined;
  readonly headerSection?: React.ReactNode | undefined;
  readonly sidebarSection?: React.ReactNode | undefined;
};

export function LayoutSection({
  sx,
  cssVars,
  children,
  footerSection,
  headerSection,
  sidebarSection,
  className,
  ...other
}: LayoutSectionProps) {
  const inputGlobalStyles = (
    <GlobalStyles
      styles={(theme) => ({
        body: { ...layoutSectionVars(theme), ...cssVars },
      })}
    />
  );

  return (
    <>
      {inputGlobalStyles}

      <LayoutRoot id="root__layout" className={mergeClasses([layoutClasses.root, className])} sx={sx ?? {}} {...other}>
        {sidebarSection ? (
          <>
            {sidebarSection}
            <LayoutSidebarContainer className={layoutClasses.sidebarContainer}>
              {headerSection}
              {children}
              {footerSection}
            </LayoutSidebarContainer>
          </>
        ) : (
          <>
            {headerSection}
            {children}
            {footerSection}
          </>
        )}
      </LayoutRoot>
    </>
  );
}

const LayoutRoot = styled("div")``;

const LayoutSidebarContainer = styled("div")(() => ({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
}));
