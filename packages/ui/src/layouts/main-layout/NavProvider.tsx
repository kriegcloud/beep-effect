"use client";

import paths from "@beep/ui/layouts/main-layout/paths";
import type { SubMenuItem } from "@beep/ui/layouts/main-layout/sitemap";
import { useBreakpoints } from "@beep/ui/providers";
import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { COLLAPSE_NAVBAR, EXPAND_NAVBAR } from "@beep/ui/settings-v2/SettingsReducer";
import { mainDrawerWidth } from "@beep/ui-core/settings";
import { type Breakpoint, type ToolbarOwnProps, useTheme } from "@mui/material";
import { usePathname } from "next/navigation";
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  use,
  useEffect,
  useMemo,
  useState,
} from "react";

interface NavContextInterface {
  openItems: string[];
  setOpenItems: Dispatch<SetStateAction<string[]>>;
  isNestedItemOpen: (items?: SubMenuItem[]) => boolean;
  sidenavAppbarVariant: ToolbarOwnProps["variant"];
  topbarHeight: Partial<Record<Breakpoint, number>>;
  sidenavCollapsed: boolean;
}

const NavContext = createContext({} as NavContextInterface);

const NavProvider = ({ children }: PropsWithChildren) => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [responsievSidenavCollapsed, setResponsiveSidenavCollapsed] = useState(false);
  const pathname = usePathname();

  const { currentBreakpoint, down } = useBreakpoints();

  const theme = useTheme();
  const downMd = down("md");

  const {
    config: { sidenavCollapsed, navigationMenuType, topnavType, sidenavType },
    setConfig,
    configDispatch,
  } = useSettingsContext();

  const isNestedItemOpen = (items: SubMenuItem[] = []) => {
    if (pathname === paths.comingSoon) {
      return false;
    }
    const checkLink = (children: SubMenuItem) => {
      if (
        `${children.path}` === pathname ||
        (children.selectionPrefix && pathname!.includes(children.selectionPrefix))
      ) {
        return true;
      }
      return children.items?.some(checkLink);
    };
    return items.some(checkLink);
  };

  const sidenavAppbarVariant: ToolbarOwnProps["variant"] = useMemo(() => {
    if (navigationMenuType === "sidenav") {
      return "appbar";
    }
    if (navigationMenuType === "combo") {
      switch (topnavType) {
        case "default": {
          return "appbar";
        }
        case "slim": {
          return "appbarSlim";
        }
        case "stacked": {
          return downMd ? "appbar" : "appbarStacked";
        }
      }
    }
  }, [navigationMenuType, topnavType, downMd]);

  const topbarHeight = useMemo(() => {
    if (navigationMenuType === "sidenav") {
      return theme.mixins.topbar.default;
    }
    return theme.mixins.topbar[topnavType];
  }, [navigationMenuType, topnavType]);

  useEffect(() => {
    if (navigationMenuType === "sidenav" || navigationMenuType === "combo") {
      if (sidenavType !== "slim") {
        if (sidenavCollapsed) {
          configDispatch({
            type: COLLAPSE_NAVBAR,
          });
        }
        if (currentBreakpoint === "md") {
          configDispatch({
            type: COLLAPSE_NAVBAR,
          });
          setResponsiveSidenavCollapsed(true);
        }
        if (downMd) {
          configDispatch({
            type: EXPAND_NAVBAR,
          });
        }
      } else {
        setConfig({
          drawerWidth: mainDrawerWidth.slim,
        });
      }
      if (currentBreakpoint === "md") {
        setConfig({
          openNavbarDrawer: false,
        });
      }
    }
    if (!loaded) {
      setLoaded(true);
    }
  }, [currentBreakpoint, navigationMenuType, downMd, sidenavType, sidenavCollapsed]);

  useEffect(() => {
    if (currentBreakpoint !== "md" && responsievSidenavCollapsed) {
      setResponsiveSidenavCollapsed(false);
      configDispatch({
        type: EXPAND_NAVBAR,
      });
    }
  }, [currentBreakpoint]);

  return (
    <NavContext
      value={{
        openItems,
        setOpenItems,
        isNestedItemOpen,
        sidenavAppbarVariant,
        topbarHeight,
        sidenavCollapsed,
      }}
    >
      {loaded && children}
    </NavContext>
  );
};

export const useNavContext = () => use(NavContext);

export default NavProvider;
