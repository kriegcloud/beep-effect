"use client";

import { Iconify, type IconifyProps } from "@beep/ui/atoms";
import paths from "@beep/ui/layouts/main-layout/paths";
import type { SubMenuItem } from "@beep/ui/layouts/main-layout/sitemap";
import { useBreakpoints } from "@beep/ui/providers";
import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { COLLAPSE_NAVBAR } from "@beep/ui/settings-v2/SettingsReducer";
import { cssVarRgba } from "@beep/ui-core/utils";
import { Badge, Box, badgeClasses, Chip, Collapse } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon, { listItemIconClasses } from "@mui/material/ListItemIcon";
import ListItemText, { listItemTextClasses } from "@mui/material/ListItemText";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavContext } from "../NavProvider";
import DocSearch from "./doc-search/DocSearch";
import NavItemPopper from "./NavItemPopper";

interface NavItemProps {
  item: SubMenuItem;
  level: number;
}

interface NavItemCollapseProps {
  item: SubMenuItem;
  level: number;
}

const NavItem = ({ item, level }: NavItemProps) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [openPopperMenu, setOpenPopperMenu] = useState(false);
  const pathname = usePathname();
  const { setOpenItems, openItems, isNestedItemOpen } = useNavContext();
  const { currentBreakpoint, up } = useBreakpoints();
  const upMd = up("md");
  const upLg = up("lg");
  const {
    config: { sidenavCollapsed, sideNavType, navColor, openNavbarDrawer },
    configDispatch,
    handleDrawerToggle,
  } = useSettingsContext();

  const hasNestedItems = useMemo(() => Object.prototype.hasOwnProperty.call(item, "items"), [item]);
  const isStackedSideNav = useMemo(() => upMd && sideNavType === "stacked", [sideNavType, upMd]);

  const expandIcon = (
    <Iconify
      icon="material-symbols:expand-more-rounded"
      className="expand-icon"
      sx={[
        {
          fontSize: 12,
          transition: (theme) =>
            theme.transitions.create("transform", {
              duration: theme.transitions.duration.shorter,
            }),
        },
        openItems[level] === item.pathName && {
          transform: "rotate(180deg)",
        },
        sidenavCollapsed &&
          !isStackedSideNav && {
            transform: (theme) => (theme.direction === "rtl" ? "rotate(-270deg)" : "rotate(270deg)"),
            position: "absolute",
            right: 8,
          },
      ]}
    />
  );

  const toggleCollapseItem = () => {
    if (!hasNestedItems) {
      if (openNavbarDrawer) {
        handleDrawerToggle();
      } else if (!upLg && !sidenavCollapsed) {
        configDispatch({ type: COLLAPSE_NAVBAR });
      }
      return;
    }

    if (!sidenavCollapsed || isStackedSideNav) {
      if (hasNestedItems) {
        if (openItems[level] === item.pathName) {
          setOpenItems(openItems.slice(0, level));
        } else {
          const updatedOpenItems = [...openItems];
          updatedOpenItems[level] = item.pathName;
          setOpenItems(updatedOpenItems);
        }
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenPopperMenu(false);
  };

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenPopperMenu(true);
  };

  useEffect(() => {
    if (isNestedItemOpen(item.items)) {
      setOpenItems((prev) => {
        const updatedOpenItems = [...prev];
        updatedOpenItems[level] = item.pathName;
        return updatedOpenItems;
      });
    }
  }, [currentBreakpoint]);

  return (
    <>
      <ListItem key={item.pathName} disablePadding sx={[isStackedSideNav && { mb: 0.25 }]}>
        <ListItemButton
          component={item.items ? "div" : Link}
          href={item.path}
          onClick={toggleCollapseItem}
          onMouseEnter={sidenavCollapsed ? handleMouseEnter : undefined}
          onMouseLeave={sidenavCollapsed ? handleClose : undefined}
          aria-expanded={openPopperMenu}
          selected={
            pathname !== paths.comingSoon &&
            (pathname === item.path ||
              (item.selectionPrefix && pathname!.includes(item.selectionPrefix)) ||
              (sidenavCollapsed && sideNavType === "default" && isNestedItemOpen(item.items)) ||
              (openItems[level] !== item.pathName && isNestedItemOpen(item.items)))
          }
          sx={[
            (theme) => ({
              p: theme.spacing("3.5px", 2),
              "&.Mui-selected": {
                [`& .${listItemTextClasses.primary}`]: {
                  color: "primary.main",
                },
              },
            }),
            !item.active && {
              [`& .${listItemTextClasses.primary}`]: {
                color: ({ palette }) =>
                  navColor === "vibrant" ? `${palette.vibrant.text.disabled} !important` : "text.disabled",
              },
              [`& .${listItemIconClasses.root}`]: {
                color: ({ palette }) =>
                  navColor === "vibrant" ? `${palette.vibrant.text.disabled} !important` : "text.disabled",
              },
            },
            sidenavCollapsed &&
              !isStackedSideNav && {
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                textAlign: "center",
                p: 1,
              },
            (!sidenavCollapsed || level !== 0) && {
              minWidth: !isStackedSideNav ? 180 : "auto",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              textAlign: "left",
            },
            openPopperMenu && {
              backgroundColor: ({ vars }) =>
                level === 0 && navColor === "vibrant"
                  ? cssVarRgba(vars.palette.primary.mainChannel, 0.36)
                  : "action.hover",
            },
          ]}
        >
          {item.icon && !isStackedSideNav && (
            <Badge
              variant="dot"
              color="warning"
              invisible={sidenavCollapsed && (item.hasNew || item.new) ? false : true}
              sx={{
                [`& .${badgeClasses.badge}`]: {
                  top: 4,
                  right: -8,
                  transition: "none",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  "& .iconify": {
                    fontSize: sidenavCollapsed ? 24 : 14,
                  },
                }}
              >
                <Iconify icon={item.icon as IconifyProps["icon"]} sx={item.iconSx} />
              </ListItemIcon>
            </Badge>
          )}

          <Box
            sx={[
              {
                flex: 1,
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              },
              level === 0 &&
                !isStackedSideNav &&
                sidenavCollapsed && {
                  px: 1,
                },
            ]}
          >
            <ListItemText
              sx={{
                [`& .${listItemTextClasses.primary}`]: {
                  typography: "caption",
                  fontWeight: "medium",
                  lineHeight: 1.3,
                  color: level === 0 ? "text.primary" : "text.secondary",
                  ...(!sidenavCollapsed || level > 0 || isStackedSideNav
                    ? { whiteSpace: "nowrap" }
                    : { whiteSpace: "normal", lineClamp: 1, wordBreak: "break-all" }),
                },
              }}
            >
              {(!sidenavCollapsed || level > 0 || isStackedSideNav) && item.hasNew ? (
                <Badge variant="dot" color="warning" sx={{ [`& .${badgeClasses.badge}`]: { top: 6, right: -8 } }}>
                  {t(item.key || item.name)}
                </Badge>
              ) : (
                t(item.key || item.name)
              )}

              {item.new && (!sidenavCollapsed || level > 0 || isStackedSideNav) && (
                <Chip size="small" label="new" color="warning" sx={{ textTransform: "capitalize", ml: 1 }} />
              )}
            </ListItemText>

            {hasNestedItems && expandIcon}
          </Box>
          {hasNestedItems && sidenavCollapsed && !isStackedSideNav && (
            <NavItemPopper
              handleClose={handleClose}
              anchorEl={anchorEl as HTMLElement}
              open={!!anchorEl && openPopperMenu}
              level={level + 1}
            >
              {(item.pathName === "doc-guide" || item.pathName === "doc-components") && openPopperMenu && (
                <DocSearch
                  key={item.name as "Guide" | "Components"}
                  filterGroup={item.name as "Guide" | "Components"}
                />
              )}
              <List
                dense
                disablePadding
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {item.items!.map((nestedItem) => (
                  <NavItem key={nestedItem.pathName} item={nestedItem} level={level + 1} />
                ))}
              </List>
            </NavItemPopper>
          )}
        </ListItemButton>
      </ListItem>

      {hasNestedItems && (!sidenavCollapsed || isStackedSideNav) && <NavItemCollapse item={item} level={level} />}
    </>
  );
};

export default NavItem;

const NavItemCollapse = ({ item, level }: NavItemCollapseProps) => {
  const { openItems } = useNavContext();

  return (
    <Collapse in={openItems[level] === item.pathName} timeout="auto" unmountOnExit>
      <List dense disablePadding sx={{ pl: level === 0 ? 4 : 2, display: "flex", flexDirection: "column", gap: "2px" }}>
        {item.items!.map((nestedItem) => (
          <NavItem key={nestedItem.pathName} item={nestedItem} level={level + 1} />
        ))}
      </List>
    </Collapse>
  );
};
