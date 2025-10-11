import { mergeClasses } from "@beep/ui-core/utils";
import ButtonBase from "@mui/material/ButtonBase";
import type { CSSObject } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import { Iconify } from "../../../atoms";
import { navItemStyles, navSectionClasses } from "../styles";
import type { NavItemProps } from "../types";
import { createNavItem } from "../utils";

export function NavItem({
  path,
  icon,
  info,
  title,
  caption,

  open,
  active,
  disabled,

  depth,
  render,
  hasChild,
  slotProps,
  className,
  externalLink,
  enabledRootRedirect,
  ...other
}: NavItemProps) {
  const navItem = createNavItem({
    path,
    icon,
    info,
    depth,
    render,
    hasChild,
    externalLink,
    enabledRootRedirect,
  });

  const ownerState: StyledState = {
    open,
    active,
    disabled,
    variant: navItem.rootItem ? "rootItem" : "subItem",
  };

  return (
    <ItemRoot
      aria-label={title}
      {...ownerState}
      {...navItem.baseProps}
      className={mergeClasses([navSectionClasses.item.root, className], {
        [navSectionClasses.state.open]: open,
        [navSectionClasses.state.active]: active,
        [navSectionClasses.state.disabled]: disabled,
      })}
      sx={slotProps?.sx}
      {...other}
    >
      {icon && (
        <ItemIcon {...ownerState} className={navSectionClasses.item.icon} sx={slotProps?.icon}>
          {navItem.renderIcon}
        </ItemIcon>
      )}

      {title && (
        <ItemTexts {...ownerState} className={navSectionClasses.item.texts} sx={slotProps?.texts}>
          <ItemTitle {...ownerState} className={navSectionClasses.item.title} sx={slotProps?.title}>
            {title}
          </ItemTitle>

          {caption && (
            <Tooltip title={caption} placement="top-start">
              <ItemCaptionText {...ownerState} className={navSectionClasses.item.caption} sx={slotProps?.caption}>
                {caption}
              </ItemCaptionText>
            </Tooltip>
          )}
        </ItemTexts>
      )}

      {info && (
        <ItemInfo {...ownerState} className={navSectionClasses.item.info} sx={slotProps?.info}>
          {navItem.renderInfo}
        </ItemInfo>
      )}

      {hasChild && (
        <ItemArrow
          {...ownerState}
          icon={open ? "eva:arrow-ios-downward-fill" : "eva:arrow-ios-forward-fill"}
          className={navSectionClasses.item.arrow}
          sx={slotProps?.arrow}
        />
      )}
    </ItemRoot>
  );
}

type StyledState = Pick<NavItemProps, "open" | "active" | "disabled"> & {
  variant: "rootItem" | "subItem";
};

const shouldForwardProp = (prop: string) => !["open", "active", "disabled", "variant", "sx"].includes(prop);

/**
 * @slot root
 */
const ItemRoot = styled(ButtonBase, { shouldForwardProp })<StyledState>(({ active, open, theme }) => {
  const bulletSvg = `"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' viewBox='0 0 14 14'%3E%3Cpath d='M1 1v4a8 8 0 0 0 8 8h4' stroke='%23efefef' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E"`;

  const bulletStyles: CSSObject = {
    left: 0,
    content: '""',
    position: "absolute",
    width: "var(--nav-bullet-size)",
    height: "var(--nav-bullet-size)",
    backgroundColor: "var(--nav-bullet-light-color)",
    mask: `url(${bulletSvg}) no-repeat 50% 50%/100% auto`,
    WebkitMask: `url(${bulletSvg}) no-repeat 50% 50%/100% auto`,
    transform:
      theme.direction === "rtl"
        ? "translate(calc(var(--nav-bullet-size) * 1), calc(var(--nav-bullet-size) * -0.4)) scaleX(-1)"
        : "translate(calc(var(--nav-bullet-size) * -1), calc(var(--nav-bullet-size) * -0.4))",
    ...theme.applyStyles("dark", {
      backgroundColor: "var(--nav-bullet-dark-color)",
    }),
  };

  const rootItemStyles: CSSObject = {
    minHeight: "var(--nav-item-root-height)",
    ...(open && {
      color: "var(--nav-item-root-open-color)",
      backgroundColor: "var(--nav-item-root-open-bg)",
    }),
    ...(active && {
      color: "var(--nav-item-root-active-color)",
      backgroundColor: "var(--nav-item-root-active-bg)",
      "&:hover": { backgroundColor: "var(--nav-item-root-active-hover-bg)" },
      ...theme.applyStyles("dark", {
        color: "var(--nav-item-root-active-color-on-dark)",
      }),
    }),
  };

  const subItemStyles: CSSObject = {
    minHeight: "var(--nav-item-sub-height)",
    "&::before": bulletStyles,
    ...(open && {
      color: "var(--nav-item-sub-open-color)",
      backgroundColor: "var(--nav-item-sub-open-bg)",
    }),
    ...(active && {
      color: "var(--nav-item-sub-active-color)",
      backgroundColor: "var(--nav-item-sub-active-bg)",
    }),
  };

  return {
    width: "100%",
    paddingTop: "var(--nav-item-pt)",
    paddingLeft: "var(--nav-item-pl)",
    paddingRight: "var(--nav-item-pr)",
    paddingBottom: "var(--nav-item-pb)",
    borderRadius: "var(--nav-item-radius)",
    color: "var(--nav-item-color)",
    "&:hover": { backgroundColor: "var(--nav-item-hover-bg)" },
    variants: [
      { props: { variant: "rootItem" }, style: rootItemStyles },
      { props: { variant: "subItem" }, style: subItemStyles },
      { props: { disabled: true }, style: navItemStyles.disabled },
    ],
  };
});

/**
 * @slot icon
 */
const ItemIcon = styled("span", { shouldForwardProp })<StyledState>(() => ({
  ...navItemStyles.icon,
  width: "var(--nav-icon-size)",
  height: "var(--nav-icon-size)",
  margin: "var(--nav-icon-margin)",
}));

/**
 * @slot texts
 */
const ItemTexts = styled("span", { shouldForwardProp })<StyledState>(() => ({
  ...navItemStyles.texts,
}));

/**
 * @slot title
 */
const ItemTitle = styled("span", { shouldForwardProp })<StyledState>(({ theme }) => ({
  ...navItemStyles.title(theme),
  ...theme.typography.body2,
  fontWeight: theme.typography.fontWeightMedium,
  variants: [{ props: { active: true }, style: { fontWeight: theme.typography.fontWeightSemiBold } }],
}));

/**
 * @slot caption text
 */
const ItemCaptionText = styled("span", { shouldForwardProp })<StyledState>(({ theme }) => ({
  ...navItemStyles.captionText(theme),
  color: "var(--nav-item-caption-color)",
}));

/**
 * @slot info
 */
const ItemInfo = styled("span", { shouldForwardProp })<StyledState>(({ theme }) => ({
  ...navItemStyles.info,
}));

/**
 * @slot arrow
 */
const ItemArrow = styled(Iconify, { shouldForwardProp })<StyledState>(({ theme }) => ({
  ...navItemStyles.arrow(theme),
}));
