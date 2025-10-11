import { mergeClasses } from "@beep/ui-core/utils";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";
import { useBoolean } from "../../../hooks";
import { Nav, NavLi, NavSubheader, NavUl } from "../components";
import { navSectionClasses, navSectionCssVars } from "../styles";
import type { NavGroupProps, NavSectionProps } from "../types";
import { NavList } from "./nav-list";

export function NavSectionVertical({
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

  const cssVars = { ...navSectionCssVars.vertical(theme), ...overridesVars };

  return (
    <Nav
      className={mergeClasses([navSectionClasses.vertical, className])}
      sx={[{ ...cssVars }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <NavUl sx={{ flex: "1 1 auto", gap: "var(--nav-item-gap)" }}>
        {data.map((group) => (
          <Group
            key={group.subheader ?? group.items[0]?.title}
            subheader={group.subheader}
            items={group.items}
            render={render}
            slotProps={slotProps}
            checkPermissions={checkPermissions}
            enabledRootRedirect={enabledRootRedirect}
          />
        ))}
      </NavUl>
    </Nav>
  );
}

function Group({ items, render, subheader, slotProps, checkPermissions, enabledRootRedirect }: NavGroupProps) {
  const groupOpen = useBoolean(true);

  const renderContent = () => (
    <NavUl sx={{ gap: "var(--nav-item-gap)" }}>
      {items.map((list) => (
        <NavList
          key={list.title}
          data={list}
          render={render}
          depth={1}
          slotProps={slotProps}
          checkPermissions={checkPermissions}
          enabledRootRedirect={enabledRootRedirect}
        />
      ))}
    </NavUl>
  );

  return (
    <NavLi>
      {subheader ? (
        <>
          <NavSubheader
            data-title={subheader}
            open={groupOpen.value}
            onClick={groupOpen.onToggle}
            sx={slotProps?.subheader}
          >
            {subheader}
          </NavSubheader>

          <Collapse in={groupOpen.value}>{renderContent()}</Collapse>
        </>
      ) : (
        renderContent()
      )}
    </NavLi>
  );
}
