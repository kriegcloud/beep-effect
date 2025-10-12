"use client";

import { Iconify, type IconifyProps } from "@beep/ui/atoms";
import paths from "@beep/ui/layouts/main-layout/paths";
import type { SubMenuItem } from "@beep/ui/layouts/main-layout/sitemap";
import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { cssVarRgba } from "@beep/ui-core/utils";
import {
  Badge,
  badgeClasses,
  Chip,
  ListItem,
  ListItemButton,
  ListItemText,
  listItemTextClasses,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useMemo, useState } from "react";
import { useNavContext } from "../NavProvider";
import DocSearch from "./doc-search/DocSearch";
import NavItemPopper from "./NavItemPopper";

interface SlimNavItemProps {
  item: SubMenuItem;
  level: number;
}

const SlimNavItem = ({ item, level }: SlimNavItemProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openPopperMenu, setOpenPopperMenu] = useState(false);
  const pathname = usePathname();
  const { setOpenItems, openItems, isNestedItemOpen } = useNavContext();

  const {
    config: { navColor },
  } = useSettingsContext();

  const hasNestedItems = useMemo(() => Object.prototype.hasOwnProperty.call(item, "items"), [item]);

  const toggleCollapseItem = (event: MouseEvent<HTMLElement>) => {
    if (level === 0) {
      setAnchorEl(event.currentTarget);
      setOpenPopperMenu(true);
      setOpenItems([item.pathName]);
    } else {
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

  const handleMouseEnter = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenPopperMenu(true);
  };

  const listItemIconButton = (
    <ListItemButton
      component={hasNestedItems ? "button" : Link}
      href={item.path}
      onClick={toggleCollapseItem}
      aria-expanded={openPopperMenu}
      selected={
        pathname !== paths.comingSoon &&
        (pathname === item.path ||
          (item.selectionPrefix && pathname!.includes(item.selectionPrefix)) ||
          isNestedItemOpen(item.items))
      }
      sx={[
        {
          color: "text.secondary",
          p: 1.5,
          justifyContent: "center",
          height: 48,
          width: 48,
        },
        !item.active && {
          color: ({ vars }) =>
            navColor === "vibrant" ? `${vars.palette.vibrant.text.disabled} !important` : "text.disabled",
        },
        openPopperMenu && {
          backgroundColor: ({ vars }) =>
            navColor === "vibrant" ? cssVarRgba(vars.palette.primary.mainChannel, 0.36) : "action.hover",
        },
      ]}
    >
      {item.icon && (
        <Badge
          variant="dot"
          color="warning"
          invisible={!item.new && !item.hasNew}
          sx={{ [`& .${badgeClasses.badge}`]: { top: -4, right: -4 } }}
        >
          <Iconify icon={item.icon as IconifyProps["icon"]} sx={{ fontSize: 22 }} />
        </Badge>
      )}

      {item.items && (
        <Iconify
          icon="material-symbols:keyboard-arrow-right"
          sx={{
            fontSize: 12,
            position: "absolute",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
          }}
        />
      )}
    </ListItemButton>
  );

  const listItemButton = (
    <ListItemButton
      component={item.items ? "button" : Link}
      href={item.path}
      onClick={toggleCollapseItem}
      aria-expanded={openPopperMenu}
      selected={pathname !== paths.comingSoon && pathname === item.path}
      sx={[
        {
          color: "text.secondary",
          minWidth: 180,
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          py: 0.75,
          pl: 2,
          pr: 1.25,
        },
        !item.active && {
          color: "text.disabled",
        },
      ]}
    >
      <Box
        sx={{
          flex: 1,
          width: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <ListItemText
          sx={{
            [`& .${listItemTextClasses.primary}`]: {
              fontSize: 14,
              display: "flex",
              alignItems: "center",
            },
          }}
        >
          {item.name}
          {item.new && <Chip size="small" label="new" color="warning" sx={{ textTransform: "capitalize", ml: 1 }} />}
        </ListItemText>

        {hasNestedItems && (
          <Iconify
            icon="material-symbols:keyboard-arrow-right"
            sx={{
              fontSize: 12,
            }}
          />
        )}
      </Box>
    </ListItemButton>
  );

  return (
    <ListItem
      key={item.pathName}
      disablePadding
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleClose}
      sx={[
        {
          flexDirection: "column",
        },
      ]}
    >
      {level === 0 ? (
        <Tooltip title={item.name} open={item.items ? false : undefined} placement="right" arrow>
          {listItemIconButton}
        </Tooltip>
      ) : (
        listItemButton
      )}

      {hasNestedItems && (
        <NavItemPopper
          handleClose={handleClose}
          anchorEl={anchorEl as HTMLElement}
          open={!!anchorEl && openPopperMenu}
          level={level + 1}
        >
          {(item.pathName === "doc-guide" || item.pathName === "doc-components") && (
            <DocSearch filterGroup={item.name as "Guide" | "Components"} />
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
              <SlimNavItem key={nestedItem.pathName} item={nestedItem} level={level + 1} />
            ))}
          </List>
        </NavItemPopper>
      )}
    </ListItem>
  );
};

export default SlimNavItem;
