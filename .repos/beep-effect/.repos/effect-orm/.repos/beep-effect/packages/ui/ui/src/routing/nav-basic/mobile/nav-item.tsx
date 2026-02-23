import { Iconify } from "@beep/ui/atoms";
import { mergeClasses } from "@beep/ui-core/utils";
import ButtonBase from "@mui/material/ButtonBase";
import type { CSSObject } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import { navBasicClasses, navItemStyles } from "../styles";
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
    disabled: Boolean(disabled),
    variant: navItem.rootItem ? "rootItem" : "subItem",
  };

  return (
    <ItemRoot
      aria-label={title}
      {...ownerState}
      {...navItem.baseProps}
      className={mergeClasses([navBasicClasses.item.root, className], {
        [navBasicClasses.state.open]: open,
        [navBasicClasses.state.active]: active,
        [navBasicClasses.state.disabled]: disabled,
      })}
      sx={slotProps?.sx ?? {}}
      {...other}
    >
      {icon && (
        <ItemIcon {...ownerState} className={navBasicClasses.item.icon} sx={slotProps?.icon ?? {}}>
          {navItem.renderIcon}
        </ItemIcon>
      )}

      {title && (
        <ItemTexts {...ownerState} className={navBasicClasses.item.texts} sx={slotProps?.texts ?? {}}>
          <ItemTitle {...ownerState} className={navBasicClasses.item.title} sx={slotProps?.title ?? {}}>
            {title}
          </ItemTitle>

          {caption && (
            <Tooltip title={caption} placement="top-start">
              <ItemCaptionText {...ownerState} className={navBasicClasses.item.caption} sx={slotProps?.caption ?? {}}>
                {caption}
              </ItemCaptionText>
            </Tooltip>
          )}
        </ItemTexts>
      )}

      {info && (
        <ItemInfo {...ownerState} className={navBasicClasses.item.info} sx={slotProps?.info ?? {}}>
          {navItem.renderInfo}
        </ItemInfo>
      )}

      {hasChild && (
        <ItemArrow
          {...ownerState}
          icon={open ? "eva:arrow-ios-downward-fill" : "eva:arrow-ios-forward-fill"}
          className={navBasicClasses.item.arrow}
          sx={slotProps?.arrow ?? {}}
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
const ItemRoot = styled(ButtonBase, { shouldForwardProp })<StyledState>(({ open, theme, active }) => {
  const dotStyles: CSSObject = {
    width: 3,
    left: -13,
    height: 16,
    content: '""',
    borderRadius: 3,
    position: "absolute",
    backgroundColor: "currentColor",
    transform: active ? "scale(1)" : "scale(0)",
    transition: theme.transitions.create(["transform"], {
      duration: theme.transitions.duration.short,
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
    "&::before": dotStyles,
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
    color: "var(--nav-item-color)",
    borderRadius: "var(--nav-item-radius)",
    paddingTop: "var(--nav-item-pt)",
    paddingLeft: "var(--nav-item-pl)",
    paddingRight: "var(--nav-item-pr)",
    paddingBottom: "var(--nav-item-pb)",
    "&:hover": { backgroundColor: "var(--nav-item-hover-color)" },
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
  variants: [
    {
      props: { active: true },
      style: { fontWeight: theme.typography.fontWeightSemiBold },
    },
  ],
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
const ItemInfo = styled("span", { shouldForwardProp })<StyledState>(() => ({
  ...navItemStyles.info,
}));

/**
 * @slot arrow
 */
const ItemArrow = styled(Iconify, { shouldForwardProp })<StyledState>(({ theme }) => ({
  ...navItemStyles.arrow(theme),
}));
