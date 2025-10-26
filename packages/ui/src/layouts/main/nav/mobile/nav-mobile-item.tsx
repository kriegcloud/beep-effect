import { Iconify } from "@beep/ui/atoms";
import { createNavItem, navItemStyles, navSectionClasses } from "@beep/ui/routing";

import { mergeClasses, rgbaFromChannel } from "@beep/ui-core/utils";
import ButtonBase from "@mui/material/ButtonBase";
import type { CSSObject } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import type { NavItemProps } from "../types";

export function NavItem({
  path,
  icon,
  title,

  open,
  active,

  hasChild,
  className,
  externalLink,
  ...other
}: NavItemProps) {
  const navItem = createNavItem({
    path,
    icon,
    hasChild,
    externalLink,
  });

  const ownerState: StyledState = { open, active };

  return (
    <ItemRoot
      aria-label={title}
      {...ownerState}
      {...navItem.baseProps}
      className={mergeClasses([navSectionClasses.item.root, className], {
        [navSectionClasses.state.open]: open,
        [navSectionClasses.state.active]: active,
      })}
      {...other}
    >
      <ItemIcon {...ownerState}> {navItem.renderIcon}</ItemIcon>

      <ItemTitle {...ownerState}>{title}</ItemTitle>

      {hasChild && (
        <ItemArrow {...ownerState} icon={open ? "eva:arrow-ios-downward-fill" : "eva:arrow-ios-forward-fill"} />
      )}
    </ItemRoot>
  );
}

type StyledState = Pick<NavItemProps, "open" | "active">;

const shouldForwardProp = (prop: string) => !["open", "active", "sx"].includes(prop);

/**
 * @slot root
 */
const ItemRoot = styled(ButtonBase, { shouldForwardProp })<StyledState>(({ theme }) => {
  const openStyles: CSSObject = {
    color: theme.vars.palette.text.primary,
    backgroundColor: theme.vars.palette.action.hover,
  };

  const activeStyles: CSSObject = {
    color: theme.vars.palette.primary.main,
    backgroundColor: rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.08),
    "&:hover": {
      backgroundColor: rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.16),
    },
  };

  return {
    gap: 16,
    height: 48,
    width: "100%",
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(1.5),
    color: theme.vars.palette.text.secondary,
    variants: [
      { props: { open: true }, style: openStyles },
      { props: { active: true }, style: activeStyles },
    ],
  };
});

/**
 * @slot icon
 */
const ItemIcon = styled("span", { shouldForwardProp })<StyledState>(() => ({
  ...navItemStyles.icon,
}));

/**
 * @slot title
 */
const ItemTitle = styled("span", { shouldForwardProp })<StyledState>(({ theme }) => ({
  ...navItemStyles.title(theme),
  ...theme.typography.body2,
  fontWeight: theme.typography.fontWeightMedium,
  variants: [
    {
      props: { active: true },
      style: { fontWeight: theme.typography.fontWeightSemiBold },
    },
  ],
}));

/**
 * @slot arrow
 */
const ItemArrow = styled(Iconify, { shouldForwardProp })<StyledState>(({ theme }) => ({
  ...navItemStyles.arrow(theme),
}));
