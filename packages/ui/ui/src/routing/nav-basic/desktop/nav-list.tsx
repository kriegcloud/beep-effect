import { usePathname, usePopoverHover } from "@beep/ui/hooks";
import { isActiveLink, isExternalLink } from "@beep/ui-core/utils";
import { popoverClasses } from "@mui/material/Popover";

import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect } from "react";
import { NavDropdown, NavDropdownPaper, NavLi, NavUl } from "../components";
import { navBasicClasses } from "../styles";
import type { NavListProps, NavSubListProps } from "../types";
import { NavItem } from "./nav-item";

export function NavList({ data, depth, render, cssVars, slotProps, enabledRootRedirect }: NavListProps) {
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
      disabled={Boolean(data.disabled)}
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
        anchorOrigin={
          depth === 1
            ? { vertical: "bottom", horizontal: isRtl ? "right" : "left" }
            : { vertical: "center", horizontal: isRtl ? "left" : "right" }
        }
        transformOrigin={
          depth === 1
            ? { vertical: "top", horizontal: isRtl ? "right" : "left" }
            : { vertical: "center", horizontal: isRtl ? "right" : "left" }
        }
        slotProps={{
          paper: {
            onMouseEnter: handleOpenMenu,
            onMouseLeave: onClose,
            className: navBasicClasses.dropdown.root,
          },
        }}
        sx={{
          ...cssVars,
          [`& .${popoverClasses.paper}`]: {
            ...(depth === 1 && { pt: 1, ml: -0.75 }),
          },
        }}
      >
        <NavDropdownPaper className={navBasicClasses.dropdown.paper} sx={slotProps?.dropdown?.paper ?? {}}>
          <NavSubList
            data={data.children}
            depth={depth}
            render={render}
            cssVars={cssVars}
            slotProps={slotProps}
            enabledRootRedirect={enabledRootRedirect}
          />
        </NavDropdownPaper>
      </NavDropdown>
    );

  return (
    <NavLi disabled={Boolean(data.disabled)}>
      {renderNavItem()}
      {renderDropdown()}
    </NavLi>
  );
}

function NavSubList({ data, render, cssVars, depth = 0, slotProps, enabledRootRedirect }: NavSubListProps) {
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
          enabledRootRedirect={enabledRootRedirect}
        />
      ))}
    </NavUl>
  );
}
