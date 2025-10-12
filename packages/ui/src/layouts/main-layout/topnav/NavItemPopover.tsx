"use client";

import { Iconify } from "@beep/ui/atoms";
import paths from "@beep/ui/layouts/main-layout/paths";
import type { SubMenuItem } from "@beep/ui/layouts/main-layout/sitemap";
import { Box, Link, List, ListItemButton, ListItemText, Popover, popoverClasses } from "@mui/material";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { useNavContext } from "../NavProvider";

interface NavItemPopoverProps {
  anchorEl: HTMLButtonElement | null;
  handleClose: () => void;
  open: boolean;
  items: SubMenuItem[];
  level: number;
}

const NavitemPopover = ({ anchorEl, open, handleClose, items, level }: NavItemPopoverProps) => {
  const [itemAnchorEl, setItemAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedItems, setSelectedItems] = useState<SubMenuItem[]>([]);
  const { isNestedItemOpen } = useNavContext();
  const pathname = usePathname();

  useEffect(() => {
    return () => {
      setSelectedItems([]);
      setItemAnchorEl(null);
    };
  }, []);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: level === 0 ? "bottom" : "top",
        horizontal: level === 0 ? "left" : "right",
      }}
      hideBackdrop
      slotProps={{
        paper: {
          onMouseLeave: () => {
            handleClose();
            setItemAnchorEl(null);
            setSelectedItems([]);
          },
        },
      }}
      sx={{
        pointerEvents: "none",
        [`& .${popoverClasses.paper}`]: {
          pointerEvents: "auto",
          boxShadow: (theme) => theme.vars.shadows[3],
          minWidth: 235,
        },
      }}
    >
      <Box
        sx={{
          overflow: "hidden",
          py: 1,
        }}
      >
        <List sx={{ width: 235 }} component="nav" dense disablePadding aria-labelledby="category-list">
          {items.map((item) => (
            <Fragment key={item.pathName}>
              <ListItemButton
                component={item.items ? "div" : Link}
                href={item.items ? undefined : item.path}
                onClick={(e: any) => {
                  if (item.items) {
                    setItemAnchorEl(e.currentTarget);
                  }
                }}
                onMouseOver={(e: any) => {
                  if (item.items) {
                    setItemAnchorEl(e.currentTarget);
                    setSelectedItems(item.items);
                  } else {
                    setSelectedItems([]);
                  }
                }}
                sx={{
                  borderRadius: 0,
                  backgroundImage: "none",
                  "&.Mui-selected": {
                    backgroundColor: "transparent",
                  },
                }}
                selected={
                  pathname !== paths.comingSoon &&
                  (pathname === item.path ||
                    (item.selectionPrefix && pathname!.includes(item.selectionPrefix)) ||
                    isNestedItemOpen(item.items))
                }
              >
                <ListItemText
                  primary={item.name}
                  sx={[
                    !item.active && {
                      color: "text.disabled",
                    },
                  ]}
                />

                {item.items && <Iconify icon="material-symbols-light:keyboard-arrow-right" sx={{ fontSize: 20 }} />}
              </ListItemButton>
            </Fragment>
          ))}
        </List>
        {selectedItems.length > 0 && (
          <NavitemPopover
            handleClose={() => {
              setItemAnchorEl(null);
              setSelectedItems([]);
            }}
            anchorEl={itemAnchorEl}
            open={selectedItems.length > 0 && !!itemAnchorEl}
            items={selectedItems}
            level={level + 1}
          />
        )}
      </Box>
    </Popover>
  );
};

export default NavitemPopover;
