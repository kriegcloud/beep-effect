import type { UnsafeTypes } from "@beep/types";
import type React from "react";
import { cloneElement } from "react";
import { RouterLink } from "../../../routing/RouterLink";
import type { NavItemDataProps, NavItemOptionsProps } from "../types";

type CreateNavItemReturn = {
  subItem: boolean;
  rootItem: boolean;
  subDeepItem: boolean;
  baseProps: Record<string, UnsafeTypes.UnsafeAny>;
  renderIcon: React.ReactNode;
  renderInfo: React.ReactNode;
};

type CreateNavItemProps = Pick<NavItemDataProps, "path" | "icon" | "info"> & NavItemOptionsProps;

export function createNavItem({
  path,
  icon,
  info,
  depth,
  render,
  hasChild,
  externalLink,
  enabledRootRedirect,
}: CreateNavItemProps): CreateNavItemReturn {
  const rootItem = depth === 1;
  const subItem = !rootItem;
  const subDeepItem = Number(depth) > 2;

  const linkProps = externalLink
    ? { href: path, target: "_blank", rel: "noopener noreferrer" }
    : { component: RouterLink, href: path };

  const baseProps = hasChild && !enabledRootRedirect ? { component: "div" } : linkProps;

  /**
   * Render @icon
   */
  let renderIcon = null;

  if (icon && render?.navIcon && typeof icon === "string") {
    renderIcon = render?.navIcon[icon];
  } else {
    renderIcon = icon;
  }

  /**
   * Render @info
   */
  let renderInfo = null;

  if (info && render?.navInfo && Array.isArray(info)) {
    const [key, value] = info;
    const element = render.navInfo(value!)?.[key!];

    renderInfo = element ? cloneElement(element) : null;
  } else {
    renderInfo = info;
  }

  return {
    subItem,
    rootItem,
    subDeepItem,
    baseProps,
    renderIcon,
    renderInfo,
  };
}
