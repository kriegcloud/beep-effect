import { assetPaths } from "@beep/constants";
import { useBoolean, usePathname } from "@beep/ui/hooks";
import { NavSectionVertical, navSectionClasses } from "@beep/ui/routing";
import { isActiveLink, isExternalLink, rgbaFromChannel } from "@beep/ui-core/utils";
import Collapse from "@mui/material/Collapse";
import { useCallback, useRef } from "react";
import { NavLi } from "../components";
import type { NavListProps } from "../types";
import { NavItem } from "./nav-mobile-item";

export function NavList({ data, sx, ...other }: NavListProps) {
  const pathname = usePathname();
  const navItemRef = useRef<HTMLButtonElement>(null);

  const isOpenPath = !!data.children;

  const isActive = isActiveLink(pathname, data.path, data.deepMatch ?? !!data.children);

  const { value: open, onToggle } = useBoolean(isOpenPath);

  const handleToggleMenu = useCallback(() => {
    if (data.children) {
      onToggle();
    }
  }, [data.children, onToggle]);

  const renderNavItem = () => (
    <NavItem
      ref={navItemRef}
      // slots
      path={data.path}
      icon={data.icon}
      title={data.title}
      // state
      open={open}
      active={isActive}
      // options
      hasChild={!!data.children}
      externalLink={isExternalLink(data.path)}
      // actions
      onClick={handleToggleMenu}
    />
  );

  const renderCollapse = () =>
    !!data.children && (
      <Collapse in={open}>
        <NavSectionVertical
          data={data.children}
          sx={{ px: 1.5 }}
          slotProps={{
            rootItem: {
              sx: [
                (theme) => ({
                  minHeight: 36,
                  '&[aria-label="Dashboard"]': {
                    [`& .${navSectionClasses.item.title}`]: {
                      display: "none",
                    },
                    height: 180,
                    borderRadius: 1.5,
                    backgroundSize: "auto 88%",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundImage: `url(${assetPaths.assets.illustrations.illustrationDashboard})`,
                    border: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.12)}`,
                  },
                }),
              ],
            },
          }}
        />
      </Collapse>
    );

  return (
    <NavLi sx={sx} {...other}>
      {renderNavItem()}
      {renderCollapse()}
    </NavLi>
  );
}
