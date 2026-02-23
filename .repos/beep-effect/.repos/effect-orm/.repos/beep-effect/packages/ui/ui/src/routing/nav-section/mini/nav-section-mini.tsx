import { mergeClasses } from "@beep/ui-core/utils";
import { useTheme } from "@mui/material/styles";

import { Nav, NavLi, NavUl } from "../components";
import { navSectionClasses, navSectionCssVars } from "../styles";
import type { NavGroupProps, NavSectionProps } from "../types";
import { NavList } from "./nav-list";

export function NavSectionMini({
  sx,
  data,
  render,
  className,
  slotProps,
  checkPermissions,
  enabledRootRedirect,
  cssVars: overridesVars,
  ...other
}: NavSectionProps) {
  const theme = useTheme();

  const cssVars = { ...navSectionCssVars.mini(theme), ...overridesVars };

  return (
    <Nav
      className={mergeClasses([navSectionClasses.mini, className])}
      sx={[{ ...cssVars }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <NavUl sx={{ flex: "1 1 auto", gap: "var(--nav-item-gap)" }}>
        {data.map((group) => (
          <Group
            key={group.subheader ?? group.items[0]?.title}
            render={render}
            cssVars={cssVars}
            items={group.items}
            slotProps={slotProps}
            checkPermissions={checkPermissions}
            enabledRootRedirect={enabledRootRedirect}
          />
        ))}
      </NavUl>
    </Nav>
  );
}

function Group({ items, render, cssVars, slotProps, checkPermissions, enabledRootRedirect }: NavGroupProps) {
  return (
    <NavLi>
      <NavUl sx={{ gap: "var(--nav-item-gap)" }}>
        {items.map((list) => (
          <NavList
            key={list.title}
            depth={1}
            data={list}
            render={render}
            cssVars={cssVars}
            slotProps={slotProps}
            checkPermissions={checkPermissions}
            enabledRootRedirect={enabledRootRedirect}
          />
        ))}
      </NavUl>
    </NavLi>
  );
}
