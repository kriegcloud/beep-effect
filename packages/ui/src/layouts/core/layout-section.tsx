"use client";

import { mergeClasses } from "@beep/ui-core/utils";
import GlobalStyles from "@mui/material/GlobalStyles";
import type { CSSObject, SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

import { layoutClasses } from "./classes";
import { layoutSectionVars } from "./css-vars";

export type LayoutSectionProps = React.ComponentProps<"div"> & {
  readonly sx?: SxProps<Theme>;
  readonly cssVars?: CSSObject;
  readonly children?: React.ReactNode;
  readonly footerSection?: React.ReactNode;
  readonly headerSection?: React.ReactNode;
  readonly sidebarSection?: React.ReactNode;
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

      <LayoutRoot id="root__layout" className={mergeClasses([layoutClasses.root, className])} sx={sx} {...other}>
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
