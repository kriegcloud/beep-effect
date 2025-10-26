"use client";
import { isActiveLink, isExternalLink } from "@beep/ui-core/utils";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect } from "react";
import { usePathname, usePopoverHover } from "../../../hooks";

import { NavDropdown, NavDropdownPaper, NavLi, NavUl } from "../components";
import { navSectionClasses } from "../styles";
import type { NavListProps, NavSubListProps } from "../types";
import { NavItem } from "./nav-item";

export function NavList({
  data,
  depth,
  render,
  cssVars,
  slotProps,
  checkPermissions,
  enabledRootRedirect,
}: NavListProps) {
  const theme = useTheme();

  const pathname = usePathname();

  const isActive = isActiveLink(pathname, data.path, data.deepMatch ?? !!data.children);

  const { open, onOpen, onClose, anchorEl, elementRef: navItemRef } = usePopoverHover<HTMLButtonElement>();

  const isRtl = theme.direction === "rtl";
  const id = open ? `${data.title}-popover` : undefined;

  useEffect(() => {
    // If the pathname changes, close the menu
    if (open) {
      onClose();
    }
  }, [pathname]);

  const handleOpenMenu = useCallback(() => {
    if (data.children) {
      onOpen();
    }
  }, [data.children, onOpen]);

  const renderNavItem = () => (
    <NavItem
      ref={navItemRef}
      aria-describedby={id}
      // slots
      path={data.path}
      icon={data.icon}
      info={data.info}
      title={data.title}
      caption={data.caption}
      // state
      active={isActive}
      open={open}
      disabled={data.disabled}
      // options
      depth={depth}
      render={render}
      hasChild={!!data.children}
      externalLink={isExternalLink(data.path)}
      enabledRootRedirect={enabledRootRedirect}
      // styles
      slotProps={depth === 1 ? slotProps?.rootItem : slotProps?.subItem}
      // actions
      onMouseEnter={handleOpenMenu}
      onMouseLeave={onClose}
    />
  );

  const renderDropdown = () =>
    !!data.children && (
      <NavDropdown
        disableScrollLock
        aria-hidden={!open}
        id={id}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "center",
          horizontal: isRtl ? "left" : "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: isRtl ? "right" : "left",
        }}
        slotProps={{
          paper: {
            onMouseEnter: handleOpenMenu,
            onMouseLeave: onClose,
            className: navSectionClasses.dropdown.root,
          },
        }}
        sx={{ ...cssVars }}
      >
        <NavDropdownPaper className={navSectionClasses.dropdown.paper} sx={slotProps?.dropdown?.paper}>
          <NavSubList
            data={data.children}
            depth={depth}
            render={render}
            cssVars={cssVars}
            slotProps={slotProps}
            checkPermissions={checkPermissions}
            enabledRootRedirect={enabledRootRedirect}
          />
        </NavDropdownPaper>
      </NavDropdown>
    );

  // Hidden item by role
  if (data.allowedRoles && checkPermissions && checkPermissions(data.allowedRoles)) {
    return null;
  }

  return (
    <NavLi disabled={data.disabled}>
      {renderNavItem()}
      {renderDropdown()}
    </NavLi>
  );
}

function NavSubList({
  data,
  render,
  cssVars,
  depth = 0,
  slotProps,
  checkPermissions,
  enabledRootRedirect,
}: NavSubListProps) {
  return (
    <NavUl sx={{ gap: 0.5 }}>
      {data.map((list) => (
        <NavList
          key={list.title}
          data={list}
          render={render}
          depth={depth + 1}
          cssVars={cssVars}
          slotProps={slotProps}
          checkPermissions={checkPermissions}
          enabledRootRedirect={enabledRootRedirect}
        />
      ))}
    </NavUl>
  );
}
