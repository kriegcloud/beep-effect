import Link from "@mui/material/Link";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

import type React from "react";
import { RouterLink } from "../RouterLink";

export type BreadcrumbsLinkProps = React.ComponentProps<"div"> & {
  readonly name?: string | undefined;
  readonly href?: string | undefined;
  readonly disabled?: boolean | undefined;
  readonly icon?: React.ReactNode | undefined;
  readonly sx?: SxProps<Theme> | undefined;
};

export function BreadcrumbsLink({ href, icon, name, disabled, sx, ...other }: BreadcrumbsLinkProps) {
  const renderContent = () => (
    <ItemRoot disabled={disabled} {...other} sx={sx ?? {}}>
      {icon && <ItemIcon>{icon}</ItemIcon>}
      {name}
    </ItemRoot>
  );

  if (href) {
    return (
      <Link
        component={RouterLink}
        href={href}
        color="inherit"
        sx={{
          display: "inline-flex",
          ...(disabled && { pointerEvents: "none" }),
        }}
      >
        {renderContent()}
      </Link>
    );
  }

  return renderContent();
}

const ItemRoot = styled("div", {
  shouldForwardProp: (prop: string) => !["disabled", "sx"].includes(prop),
})<Pick<BreadcrumbsLinkProps, "disabled">>(({ disabled, theme }) => ({
  ...theme.typography.body2,
  alignItems: "center",
  gap: theme.spacing(1),
  display: "inline-flex",
  color: theme.vars.palette.text.primary,
  ...(disabled && {
    cursor: "default",
    pointerEvents: "none",
    color: theme.vars.palette.text.disabled,
  }),
}));

const ItemIcon = styled("span")(() => ({
  display: "inherit",
  /**
   * As ':first-child' for ssr
   * https://github.com/emotion-js/emotion/issues/1105#issuecomment-1126025608
   */
  "& > :first-of-type:not(style):not(:first-of-type ~ *), & > style + *": {
    width: 20,
    height: 20,
  },
}));
